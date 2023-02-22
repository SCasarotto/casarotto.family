import type { SelectPopoverProps as AriaSelectPopoverProps } from 'ariakit';
import { SelectPopover as AriaSelectPopover } from 'ariakit';
import { forwardRef } from 'react';

export type SelectPopoverProps = AriaSelectPopoverProps;
export const SelectPopover = forwardRef<HTMLDivElement, SelectPopoverProps>(
  (props, ref) => {
    const { className = '', ...rest } = props;
    return (
      <AriaSelectPopover
        className={`z-50 flex flex-col gap-1 rounded-lg border border-gray-100 bg-white p-2 drop-shadow ${className}`}
        ref={ref}
        {...rest}
      />
    );
  },
);
SelectPopover.displayName = 'SelectPopover';
