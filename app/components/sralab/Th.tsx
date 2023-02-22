import type { ComponentPropsWithRef } from 'react';
import { forwardRef } from 'react';

export type ThProps = ComponentPropsWithRef<'th'>;
export const Th = forwardRef<HTMLTableHeaderCellElement, ThProps>(
  (props, ref) => {
    const { className = '', ...rest } = props;
    return (
      <th
        className={`bg-sra-brand-orange-500 px-3 py-2 text-white ${className}`}
        ref={ref}
        {...rest}
      />
    );
  },
);
Th.displayName = 'Th';
