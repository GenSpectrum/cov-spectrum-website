export enum AlertVariant {
  DANGER = 'danger',
  WARNING = 'warning',
  INFO = 'info',
}

const getAlertClasses = (variant: AlertVariant) => {
  switch (variant) {
    case AlertVariant.DANGER: {
      return 'bg-red-100 border-red-400 text-red-900';
    }
    case AlertVariant.WARNING: {
      return 'bg-yellow-100 border-yellow-400 text-yellow-900';
    }
    case AlertVariant.INFO: {
      return 'bg-blue-100 border-blue-400 text-blue-900';
    }
    default: {
    }
  }
};

export const Alert = ({ children, variant }: { children: React.ReactNode; variant: AlertVariant }) => {
  return (
    <div className={`${getAlertClasses(variant)} border-2 px-4 py-3 m-1 rounded relative`} role='alert'>
      <span className='block sm:inline'>{children}</span>
    </div>
  );
};

export enum ButtonVariant {
  DANGER = 'danger',
  WARNING = 'warning',
  SECONDARY = 'secondary',
  PRIMARY = 'primary',
}

const getButtonClasses = (variant: ButtonVariant): string => {
  switch (variant) {
    case ButtonVariant.DANGER: {
      return 'bg-red-600 hover:bg-red-700 focus:ring-red-500 focus:ring-offset-red-200';
    }
    case ButtonVariant.WARNING: {
      return 'bg-yellow-600 hover:bg-yellow-700 focus:ring-yellow-500 focus:ring-offset-yellow-200';
    }
    case ButtonVariant.PRIMARY: {
      return 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500 focus:ring-offset-blue-200';
    }
    case ButtonVariant.SECONDARY: {
      return 'bg-indigo-300 hover:bg-indigo-500 focus:ring-indigo-500 focus:ring-offset-indigo-200';
    }
    default: {
      return '';
    }
  }
};

export const Button = ({
  variant = ButtonVariant.PRIMARY,
  children,
  onClick,
  className,
}: {
  variant: ButtonVariant;
  children?: React.ReactNode;
  onClick?: () => any;
  className?: string;
}) => {
  return (
    <div className={className}>
      <button
        className={`${getButtonClasses(
          variant
        )} "py-2 px-2 text-white w-full transition ease-in duration-100 scale-110 text-center text-base font-semibold shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 rounded-lg `}
        role='alert'
        onClick={onClick}
      >
        {children}
      </button>
    </div>
  );
};
