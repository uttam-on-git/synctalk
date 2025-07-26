import type { ComponentProps } from 'react';

type ButtonProps = ComponentProps<'button'>;

const Button = (props: ButtonProps) => {
  return (
    <button
      {...props}
      className="w-full rounded-lg bg-cyan-500 font-semibold px-6 py-3 cursor-pointer text-white transition hover:bg-cyan-700 disbaled:cursor-not-allowed disabled:bg-neutral-600"
    />
  );
};

export default Button;
