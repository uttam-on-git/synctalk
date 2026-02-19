import type { ComponentProps } from 'react';

type ButtonProps = ComponentProps<'button'>;

const Button = ({ className = '', ...props }: ButtonProps) => {
  return (
    <button
      {...props}
      className={`accent-button w-full cursor-pointer rounded-md px-6 py-3 transition disabled:cursor-not-allowed disabled:opacity-60 ${className}`.trim()}
    />
  );
};

export default Button;
