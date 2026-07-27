import { Button } from 'antd';
import type { ButtonProps } from 'antd';

type Variant = 'primary' | 'secondary' | 'tertiary';

type AppButtonProps = {
  variant?: Variant;
} & Omit<ButtonProps, 'type' | 'ghost' | 'shape' | 'variant' | 'color'>;

export function AppButton({ variant = 'primary', ...props }: AppButtonProps) {
  if (variant === 'primary') {
    return <Button type="primary" shape="round" {...props} />;
  }
  if (variant === 'secondary') {
    return <Button type="default" shape="round" {...props} />;
  }
  return <Button type="default" shape="round" ghost {...props} />;
}