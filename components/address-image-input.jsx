"use client";

export default function AddressImageInput({
  label,
  uploadTitle,
  uploadHelper,
  uploadedStatus,
  replaceLabel,
  removeLabel,
  previewUrl,
  fileName,
  onFileChange,
  onRemove,
}) {
  return (
    <div className="space-y-3">
      <span className="block text-[15px] font-medium leading-6 text-stone-700 transition-colors duration-200">
        {label}
      </span>
      <label className="flex cursor-pointer flex-col items-center justify-center rounded-[24px] border border-dashed border-stone-300 bg-[#fcfaf6] px-4 py-6 text-center transition-colors duration-200 hover:border-[#b38a45]">
        <span className="text-2xl text-stone-300">+</span>
        <span className="mt-2 text-sm font-medium leading-6 text-stone-700 transition-colors duration-200">
          {uploadTitle}
        </span>
        <span className="mt-1 text-[13px] leading-5 text-stone-400 transition-colors duration-200">
          {uploadHelper}
        </span>
        <input
          type="file"
          accept="image/png,image/jpeg,image/webp"
          onChange={onFileChange}
          className="hidden"
        />
      </label>

      {previewUrl ? (
        <div className="rounded-[24px] border border-stone-200 bg-white p-4">
          <div className="flex items-start gap-4">
            <img
              src={previewUrl}
              alt={label}
              className="h-24 w-24 rounded-2xl object-cover"
            />
            <div className="flex-1">
              <p className="text-sm font-medium leading-6 text-stone-800">
                {fileName || "address-image"}
              </p>
              <p className="mt-1 text-xs leading-5 text-stone-400 transition-colors duration-200">
                {uploadedStatus}
              </p>
              <div className="mt-3 flex gap-2">
                <label className="rounded-full border border-stone-300 px-4 py-2 text-sm font-medium text-stone-600 transition-colors duration-200 hover:border-[#b38a45] hover:text-[#b38a45]">
                  {replaceLabel}
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    onChange={onFileChange}
                    className="hidden"
                  />
                </label>
                <button
                  type="button"
                  onClick={onRemove}
                  className="rounded-full border border-red-200 px-4 py-2 text-sm font-medium text-red-500 transition-colors duration-200 hover:border-red-300 hover:text-red-600"
                >
                  {removeLabel}
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
