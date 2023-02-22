import type { ComponentProps } from 'react';

export type InputWrapperProps = ComponentProps<'div'>;
export const InputWrapper = (props: InputWrapperProps) => {
  const { className = '', ...rest } = props;
  return <div className={`mb-2 flex flex-1 flex-col ${className}`} {...rest} />;
};
InputWrapper.displayName = 'InputWrapper';
