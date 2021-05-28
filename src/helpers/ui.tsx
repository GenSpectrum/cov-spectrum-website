export enum AlertVariant {
  DANGER = 'danger',
  WARNING = 'warning',
  INFO = 'info'
}

const getAlertClasses = (variant: AlertVariant) => {

switch (variant) {
    case AlertVariant.DANGER: {
        return "bg-red-100 border-red-400 text-red-900"
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
}

export const Alert = ({ children, variant }: { children: React.ReactNode; variant: AlertVariant }) => {
  return (
    <div className={`${getAlertClasses(variant)} border-2 px-4 py-3 m-1 rounded relative`} role='alert'>
      <span className='block sm:inline'>{children}</span>
    </div>
  );
};
