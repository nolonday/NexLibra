import { useEffect } from "react";
import { createPortal } from "react-dom";

const Modal = ({ isOpen, onClose, title, children, fullPage = false }) => {
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const modalNode = (
    <div
      className={
        `fixed inset-0 bg-black/30 backdrop-blur-sm z-50 overflow-y-auto px-4 ` +
        (fullPage
          ? `flex justify-center items-center py-4 sm:py-8`
          : `flex justify-center items-center py-4 sm:py-8`)
      }
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className={
          fullPage
            ? `glass-strong rounded-2xl p-4 sm:p-6 md:p-8 max-w-xl md:max-w-2xl w-full max-h-[90vh] overflow-y-auto fade-in mx-2 sm:mx-6`
            : `glass-strong rounded-2xl p-4 sm:p-6 max-w-md sm:max-w-lg w-full max-h-[90vh] overflow-y-auto fade-in`
        }
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-start gap-3 mb-4">
          <h2 className="text-base sm:text-xl font-semibold text-gray-800 dark:text-gray-100 min-w-0">
            {title}
          </h2>
          <button
            onClick={onClose}
            className="shrink-0 text-gray-400 hover:text-gray-600 text-2xl leading-none p-1"
            aria-label="Закрыть"
          >
            &times;
          </button>
        </div>
        {children}
      </div>
    </div>
  );

  if (typeof document === "undefined") return modalNode;
  return createPortal(modalNode, document.body);
};

export default Modal;
