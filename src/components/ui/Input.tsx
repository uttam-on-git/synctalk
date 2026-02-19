import type { ComponentProps } from 'react';

type InputProps = ComponentProps<'input'>;

const Input = ({ className = '', ...props }: InputProps) => {
  return (
    <input
      {...props}
      className={`text-input mb-3 w-full rounded-md px-4 py-3 text-sm ${className}`.trim()}
    />
  );
};

export default Input;
