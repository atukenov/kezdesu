"use client";
import * as Dialog from "@radix-ui/react-dialog";
import { useState } from "react";
import { HiX } from "react-icons/hi";
import TextareaAutosize from "react-textarea-autosize";

interface CreateMeetupDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    title: string;
    description: string;
    location: string;
    time: string;
    isPublic: boolean;
    maxParticipants?: number;
  }) => void;
}

export default function CreateMeetupDialog({
  isOpen,
  onClose,
  onSubmit,
}: CreateMeetupDialogProps) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    location: "",
    time: "",
    isPublic: true,
    maxParticipants: undefined as number | undefined,
    categories: [] as string[], // New: categories/tags
  });
  const [categoryInput, setCategoryInput] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    onClose();
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50" />
        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-md bg-white rounded-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <Dialog.Title className="text-xl font-semibold">
              Create Meetup
            </Dialog.Title>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <HiX className="h-6 w-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Title
                </label>
                <input
                  type="text"
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Description
                </label>
                <TextareaAutosize
                  minRows={3}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Location
                </label>
                <input
                  type="text"
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  value={formData.location}
                  onChange={(e) =>
                    setFormData({ ...formData, location: e.target.value })
                  }
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Time
                </label>
                <input
                  type="datetime-local"
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  value={formData.time}
                  onChange={(e) =>
                    setFormData({ ...formData, time: e.target.value })
                  }
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Maximum Participants (optional)
                </label>
                <input
                  type="number"
                  min="2"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  value={formData.maxParticipants || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      maxParticipants: e.target.value
                        ? Number(e.target.value)
                        : undefined,
                    })
                  }
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Categories/Tags
                </label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {formData.categories.map((cat, idx) => (
                    <span
                      key={cat + idx}
                      className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs flex items-center gap-1"
                    >
                      {cat}
                      <button
                        type="button"
                        className="ml-1 text-blue-500 hover:text-red-500"
                        onClick={() =>
                          setFormData((prev) => ({
                            ...prev,
                            categories: prev.categories.filter(
                              (c) => c !== cat
                            ),
                          }))
                        }
                        aria-label={`Remove ${cat}`}
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
                <input
                  type="text"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="Add a category and press Enter"
                  value={categoryInput}
                  onChange={(e) => setCategoryInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (
                      e.key === "Enter" &&
                      categoryInput.trim() &&
                      !formData.categories.includes(categoryInput.trim())
                    ) {
                      e.preventDefault();
                      setFormData((prev) => ({
                        ...prev,
                        categories: [...prev.categories, categoryInput.trim()],
                      }));
                      setCategoryInput("");
                    }
                  }}
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isPublic"
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  checked={formData.isPublic}
                  onChange={(e) =>
                    setFormData({ ...formData, isPublic: e.target.checked })
                  }
                />
                <label
                  htmlFor="isPublic"
                  className="ml-2 text-sm text-gray-700"
                >
                  Make this meetup public
                </label>
              </div>
            </div>

            <div className="mt-6 flex justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
              >
                Create Meetup
              </button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
