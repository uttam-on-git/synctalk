import type { ComponentProps } from 'react';

type InputProps = ComponentProps<'input'>;

const Input = (props: InputProps) => {
  return (
    <input
      {...props}
      className="w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 mb-3 text-gray-900 text-sm placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-600"
    />
  );
};

export default Input;
