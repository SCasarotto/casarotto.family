import type { SelectProps as AriaSelectProps } from 'ariakit';
import { Select as AriaSelect } from 'ariakit';
import { forwardRef } from 'react';

import { inputStyles } from '~/utils/theme';

export type SelectProps = AriaSelectProps;
export const Select = forwardRef<HTMLButtonElement, SelectProps>(
  (props, ref) => {
    const { className = '', ...rest } = props;
    return (
      <AriaSelect
        className={`flex items-center justify-between ${inputStyles} ${className}`}
        ref={ref}
        {...rest}
      />
    );
  },
);
Select.displayName = 'Select';
