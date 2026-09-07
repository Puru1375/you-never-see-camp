import { ArrowRight } from "lucide-react";

const Button = ({
  children,
  variant = "primary",
  showIcon = true,
  className = "",
  ...props
}) => {
  const variants = {
    primary:
      "bg-fire-500 text-white hover:bg-fire-600 shadow-lg shadow-orange-900/20",

    secondary:
      "border border-white/30 bg-white/10 text-white backdrop-blur-md hover:bg-white/20",

    dark:
      "bg-forest-900 text-white hover:bg-forest-800",

    outline:
      "border border-forest-800 text-forest-900 hover:bg-forest-900 hover:text-white",
  };

  return (
    <button
      className={`
        group inline-flex items-center justify-center gap-2
        rounded-full px-6 py-3.5
        text-sm font-semibold
        transition-all duration-300
        active:scale-[0.98]
        ${variants[variant]}
        ${className}
      `}
      {...props}
    >
      {children}

      {showIcon && (
        <ArrowRight
          size={17}
          className="transition-transform duration-300 group-hover:translate-x-1"
        />
      )}
    </button>
  );
};

export default Button;