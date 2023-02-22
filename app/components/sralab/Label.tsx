import type { FormLabelProps } from 'ariakit';
import { FormLabel } from 'ariakit';
import { forwardRef } from 'react';

import { labelStyles } from '~/utils/theme';

export type LabelProps = FormLabelProps;
export const Label = forwardRef<HTMLLabelElement, LabelProps>((props, ref) => {
  const { className = '', ...rest } = props;
  return (
    <FormLabel className={`${labelStyles} ${className}`} ref={ref} {...rest} />
  );
});
Label.displayName = 'Label';
