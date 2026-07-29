import { useEffect, useState } from 'react';
import { List, Rate, Typography, Skeleton, Empty, Select, Input, Alert } from 'antd';
import { useAuth } from '@features/auth';
import { hotelReviewApi, type HotelReview } from '@entities/hotel-review';
import { bookingApi } from '@entities/booking';
import { AppButton } from '@shared/ui';
import { toScore, toStars } from '@shared/lib/rating';

interface Props {
  hotelId: number;
  onReviewSubmitted?: () => void;
}

export function ReviewsSection({ hotelId, onReviewSubmitted }: Props) {
  const { isAuthenticated } = useAuth();

  const [reviews, setReviews] = useState<HotelReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [eligibleBookingIds, setEligibleBookingIds] = useState<number[]>([]);

  const [selectedBookingId, setSelectedBookingId] = useState<number | null>(null);
  const [score, setScore] = useState(5);
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadReviews = () => {
    setLoading(true);
    hotelReviewApi.getByHotel(hotelId)
      .then(setReviews)
      .catch(() => setReviews([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadReviews();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hotelId]);

  useEffect(() => {
    if (!isAuthenticated) {
      setEligibleBookingIds([]);
      return;
    }
    bookingApi.getAll()
      .then(({ items }) => {
        const reviewedBookingIds = new Set(reviews.map((r) => r.bookingId));
        const eligible = items
          .filter((b) => b.hotelId === hotelId && b.status !== 'Cancelled' && !reviewedBookingIds.has(b.id))
          .map((b) => b.id);
        setEligibleBookingIds(eligible);
        setSelectedBookingId(eligible[0] ?? null);
      })
      .catch(() => setEligibleBookingIds([]));
  }, [isAuthenticated, hotelId, reviews]);

  const handleSubmit = () => {
    if (!selectedBookingId) return;
    setError(null);
    setSubmitting(true);
    hotelReviewApi.create({ description, score: toScore(score), bookingId: selectedBookingId })
      .then(() => {
        setDescription('');
        setScore(5);
        loadReviews();
        onReviewSubmitted?.();
      })
      .catch((err: unknown) => {
        const axiosErr = err as { response?: { data?: { error?: string } }; message?: string };
        setError(axiosErr.response?.data?.error ?? axiosErr.message ?? 'Failed to submit review');
      })
      .finally(() => setSubmitting(false));
  };

  return (
    <div>
      {loading
        ? <Skeleton active />
        : reviews.length === 0
          ? <Empty description="No reviews yet" style={{ margin: '16px 0' }} />
          : (
            <List
              itemLayout="vertical"
              dataSource={reviews}
              renderItem={(r) => (
                <List.Item>
                  <List.Item.Meta
                    title={r.authorName || 'Anonymous'}
                    description={new Date(r.createdAtUtc).toLocaleDateString()}
                  />
                  {r.score != null && <Rate disabled allowHalf value={toStars(r.score)} style={{ fontSize: 14 }} />}
                  <Typography.Paragraph style={{ marginTop: 8 }}>{r.description}</Typography.Paragraph>
                </List.Item>
              )}
            />
          )}

      {eligibleBookingIds.length > 0 && (
        <div style={{ marginTop: 24, maxWidth: 480 }}>
          <Typography.Title level={5}>Write a review</Typography.Title>

          {eligibleBookingIds.length > 1 && (
            <Select
              value={selectedBookingId}
              onChange={setSelectedBookingId}
              style={{ width: '100%', marginBottom: 12 }}
              options={eligibleBookingIds.map((id) => ({ value: id, label: `Booking #${id}` }))}
            />
          )}

          <Rate value={score} onChange={setScore} allowClear={false} style={{ marginBottom: 12 }} />

          <Input.TextArea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Share your experience..."
            rows={3}
            style={{ marginBottom: 12 }}
          />

          {error && <Alert type="error" message={error} style={{ marginBottom: 12 }} />}

          <AppButton
            variant="primary"
            onClick={handleSubmit}
            loading={submitting}
            disabled={!description.trim() || !selectedBookingId}
          >
            Submit review
          </AppButton>
        </div>
      )}
    </div>
  );
}
