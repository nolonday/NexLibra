const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex justify-center items-start sm:items-center z-50 overflow-y-auto py-4 sm:py-8 px-4">
      <div className="glass-strong rounded-2xl p-4 sm:p-6 max-w-md sm:max-w-lg w-full max-h-[90vh] overflow-y-auto fade-in my-auto">
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
};

export default Modal;
