import type { SelectItemProps as AriaSelectItemProps } from 'ariakit';
import { SelectItem as AriaSelectItem } from 'ariakit';
import { forwardRef } from 'react';

export type SelectItemProps = AriaSelectItemProps;
export const SelectItem = forwardRef<HTMLDivElement, SelectItemProps>(
  (props, ref) => {
    const { className = '', ...rest } = props;
    return (
      <AriaSelectItem
        className={`flex cursor-pointer scroll-m-2 items-center gap-2 rounded p-3 transition duration-100 ease-in active-item:bg-sra-brand-orange-500 active-item:text-white  aria-selected:bg-sra-brand-orange-500/25 active-item:aria-selected:bg-sra-brand-orange-500 ${className}`}
        ref={ref}
        {...rest}
      />
    );
  },
);
SelectItem.displayName = 'SelectItem';
