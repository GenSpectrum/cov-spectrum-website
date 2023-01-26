import React, { Fragment } from 'react';
import { Dropdown } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

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
      return 'bg-active-secondary hover:bg-active focus:ring-blue-500 focus:ring-offset-blue-200';
    }
    case ButtonVariant.SECONDARY: {
      return 'bg-gray-400 hover:bg-gray-500 focus:ring-gray-500 focus:ring-offset-gray-200';
    }
    default: {
      return '';
    }
  }
};

interface ButtonProps {
  variant: ButtonVariant;
  children?: React.ReactNode;
  onClick?: () => any;
  className?: string;
}

export const RawButton = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = ButtonVariant.PRIMARY, children, onClick, className }, ref) => {
    return (
      <button
        ref={ref}
        className={`${className} ${getButtonClasses(
          variant
        )} px-2 text-white w-full transition ease-in duration-100 scale-110 text-center text-base font-semibold shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 rounded-lg `}
        onClick={onClick}
      >
        {children}
      </button>
    );
  }
);

export const Button = ({ className, ...restProps }: ButtonProps) => {
  return (
    <div className={className}>
      <RawButton {...restProps} />
    </div>
  );
};

interface DropdownButtonProps extends Omit<ButtonProps, 'onClick'> {
  onToggle?: () => void;
}

// HACK see src/index.css
const narrowDropdownClassName = 'custom-narrow-dropdown';

export const DropdownButton = ({ onToggle, className, children, ...restProps }: DropdownButtonProps) => {
  return (
    <Dropdown onToggle={onToggle} className={`${className} ${narrowDropdownClassName}`}>
      <Dropdown.Toggle as={RawButton} {...restProps}>
        Export
      </Dropdown.Toggle>
      <Dropdown.Menu>{children}</Dropdown.Menu>
    </Dropdown>
  );
};

export const ShowMoreButton = ({ to }: { to: string }) => {
  const navigate = useNavigate();
  return (
    <Button
      className='mt-1 ml-4 w-max'
      variant={ButtonVariant.PRIMARY}
      onClick={() => {
        navigate(to);
      }}
    >
      Show more
    </Button>
  );
};

/**
 * A button bar where the buttons are separated by "|". Exactly one of the options is selected. The selected
 * one is displayed in bold. It looks roughly like this:
 * <p>
 * <u>Option 1</u> | <b>Option 2</b> | <u>Option 3</u>
 */
export const PipeDividedOptionsButtons = <T extends unknown>({
  options,
  selected,
  onSelect,
}: {
  options: { label: React.ReactNode; value: T }[];
  selected: T;
  onSelect: (value: T) => void;
}) => {
  return (
    <div>
      {options.map(({ label, value }, index) => (
        <React.Fragment key={index}>
          {index > 0 && (
            <span key={'sep-' + index} className='mx-2'>
              |
            </span>
          )}
          <span
            key={'content-' + index}
            className={value === selected ? 'font-bold' : 'underline cursor-pointer'}
            onClick={() => onSelect(value)}
          >
            {label}
          </span>
        </React.Fragment>
      ))}
    </div>
  );
};

// window.matchMedia("(any-pointer: coarse)").matches returns true on
// mobile devices (touch screen only) and false on desktops
// window.matchMedia may not be available in the test suite
export const isTouchscreenDevice = window.matchMedia
  ? window.matchMedia('(any-pointer: coarse)').matches
  : undefined;
