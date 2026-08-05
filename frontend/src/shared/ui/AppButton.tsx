import { Button, theme } from 'antd';
import type { ButtonProps } from 'antd';

type Variant = 'primary' | 'secondary' | 'tertiary';

type AppButtonProps = {
  variant?: Variant;
} & Omit<ButtonProps, 'type' | 'ghost' | 'shape' | 'variant' | 'color'>;

export function AppButton({ variant = 'primary', style, ...props }: AppButtonProps) {
  const { token } = theme.useToken();

  if (variant === 'primary') {
    return <Button type="primary" shape="round" style={style} {...props} />;
  }
  if (variant === 'secondary') {
    return <Button type="default" shape="round" style={style} {...props} />;
  }
  return (
    <Button
      type="default"
      shape="round"
      style={{
        backgroundColor: token.colorPrimaryBg,
        color: token.colorPrimary,
        border: 'none',
        ...style,
      }}
      {...props}
    />
  );
}