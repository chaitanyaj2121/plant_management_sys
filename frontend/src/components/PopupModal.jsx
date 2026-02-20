const toneClasses = {
  info: "bg-blue-50 text-blue-700 border-blue-200",
  success: "bg-green-50 text-green-700 border-green-200",
  warning: "bg-amber-50 text-amber-700 border-amber-200",
  error: "bg-red-50 text-red-700 border-red-200",
};

const buttonToneClasses = {
  info: "bg-blue-600 hover:bg-blue-700 focus:ring-blue-300",
  success: "bg-green-600 hover:bg-green-700 focus:ring-green-300",
  warning: "bg-amber-600 hover:bg-amber-700 focus:ring-amber-300",
  error: "bg-red-600 hover:bg-red-700 focus:ring-red-300",
};

const PopupModal = ({
  isOpen,
  title,
  message,
  tone = "info",
  confirmText = "OK",
  cancelText = "",
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-5 shadow-2xl">
        <div
          className={`mb-3 inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${toneClasses[tone] || toneClasses.info}`}
        >
          {title}
        </div>
        <p className="text-sm text-gray-700">{message}</p>

        <div className="mt-5 flex justify-end gap-3">
          {cancelText ? (
            <button
              type="button"
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-100"
              onClick={onCancel}
            >
              {cancelText}
            </button>
          ) : null}

          <button
            type="button"
            className={`rounded-lg px-4 py-2 text-sm font-medium text-white transition focus:outline-none focus:ring-2 ${buttonToneClasses[tone] || buttonToneClasses.info}`}
            onClick={onConfirm}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PopupModal;
