import type { FormErrorProps } from 'ariakit';
import { FormError } from 'ariakit';
import { forwardRef } from 'react';

export type InputErrorProps = FormErrorProps;
export const InputError = forwardRef<HTMLDivElement, InputErrorProps>(
  (props, ref) => {
    const { className = '', ...rest } = props;

    return (
      <FormError
        className={`mt-1 rounded-lg border border-red-700 bg-red-100 py-2 px-3 text-red-700 empty:hidden ${className}`}
        ref={ref}
        {...rest}
      />
    );
  },
);
InputError.displayName = 'InputError';
