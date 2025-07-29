import type { ComponentProps } from 'react';

type InputProps = ComponentProps<'input'>;

const Input = (props: InputProps) => {
  return (
    <input
      {...props}
      className="w-full rounded-lg border border-zinc-600 bg-zinc-700 px-4 py-3 mb-3 text-white text-sm placeholder-zinc-400 focus:outline-none focus:border-cyan-500"
    />
  );
};

export default Input;
