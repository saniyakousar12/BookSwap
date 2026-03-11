import { clsx } from 'clsx';
import { Loader } from 'lucide-react';

export const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  className = '',
  icon: Icon = null,
  iconPosition = 'left',
  ...props
}) => {
  const baseStyles = 'font-semibold rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2';

  const variants = {
    primary: 'bg-primary text-white hover:bg-primary-dark focus:ring-primary shadow-sm hover:shadow-md',
    secondary: 'bg-secondary text-white hover:bg-secondary/90 focus:ring-secondary shadow-sm hover:shadow-md',
    outline: 'border-2 border-primary text-primary hover:bg-primary/10 focus:ring-primary',
    danger: 'bg-danger text-white hover:bg-danger/90 focus:ring-danger shadow-sm hover:shadow-md',
    success: 'bg-success text-white hover:bg-success/90 focus:ring-success shadow-sm hover:shadow-md',
    ghost: 'text-gray-700 hover:bg-gray-100 focus:ring-gray-300',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
    xl: 'px-8 py-4 text-xl',
  };

  return (
    <button
      className={clsx(baseStyles, variants[variant], sizes[size], className)}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <>
          <Loader className="h-4 w-4 animate-spin" />
          Loading...
        </>
      ) : (
        <>
          {Icon && iconPosition === 'left' && <Icon className="h-4 w-4" />}
          {children}
          {Icon && iconPosition === 'right' && <Icon className="h-4 w-4" />}
        </>
      )}
    </button>
  );
};