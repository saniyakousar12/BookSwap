import { clsx } from 'clsx';

export const Card = ({
  children,
  className = '',
  hover = false,
  padding = 'p-6',
  shadow = 'shadow-md',
}) => {
  return (
    <div
      className={clsx(
        'bg-white rounded-lg transition-all duration-200',
        padding,
        shadow,
        hover && 'hover:shadow-lg hover:translate-y-[-2px] cursor-pointer',
        className
      )}
    >
      {children}
    </div>
  );
};