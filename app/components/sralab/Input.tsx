import type { FormInputProps } from 'ariakit';
import { FormInput } from 'ariakit';
import { forwardRef } from 'react';

import { inputStyles } from '~/utils/theme';

export type InputProps = FormInputProps;
export const Input = forwardRef<HTMLInputElement, FormInputProps>(
  (props, ref) => {
    const { className = '', ...rest } = props;
    return (
      <FormInput
        className={`${inputStyles} ${className}`}
        ref={ref}
        {...rest}
      />
    );
  },
);
Input.displayName = 'Input';
