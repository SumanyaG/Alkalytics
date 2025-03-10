// UploadArea.test.tsx
import React from "react";
import { render, fireEvent, screen, createEvent } from "@testing-library/react";
import UploadArea from "../../../src/components/upload/UploadArea";

describe("UploadArea Component", () => {
  const sectionTitle = "Test Upload";
  const inputId = "test-input";

  // We'll use a mock setFiles function so we can inspect its update callback.
  let files: File[] = [];
  const setFiles = jest.fn((updateFn) => {
    if (typeof updateFn === "function") {
      files = updateFn(files);
    }
  });

  beforeEach(() => {
    files = [];
    jest.clearAllMocks();
  });

  test("renders correctly with no files", () => {
    render(
      <UploadArea
        sectionTitle={sectionTitle}
        files={files}
        setFiles={setFiles}
        inputId={inputId}
      />
    );

    expect(screen.getByText(sectionTitle)).toBeInTheDocument();
    expect(screen.getByText(/Drag & drop your file here/i)).toBeInTheDocument();
  });

  test("handles drag over and drop event with valid file", () => {
    render(
      <UploadArea
        sectionTitle={sectionTitle}
        files={files}
        setFiles={setFiles}
        inputId={inputId}
      />
    );

    // Find the drop area element.
    const dropArea = screen
      .getByText(/Drag & drop your file here/i)
      .closest("div");
    expect(dropArea).toBeInTheDocument();

    // Create a valid CSV file.
    const file = new File(["file content"], "test file.csv", {
      type: "text/csv",
    });

    // Create a drop event using createEvent and set the dataTransfer property.
    const dropEvent = createEvent.drop(dropArea!, {
      dataTransfer: {
        files: [file],
        types: ["Files"],
      },
    });

    // Spy on the preventDefault method.
    const preventDefaultSpy = jest.spyOn(dropEvent, "preventDefault");

    // Simulate drag over first.
    fireEvent.dragOver(dropArea!);
    expect(dropArea).toHaveClass("bg-blue-100");

    // Fire the drop event.
    fireEvent(dropArea!, dropEvent);

    // Verify that preventDefault was called.
    expect(preventDefaultSpy).toHaveBeenCalled();
    expect(setFiles).toHaveBeenCalled();

    // Test that the file name was sanitized (spaces replaced by underscores).
    const updateFn = setFiles.mock.calls[0][0];
    const updatedFiles = updateFn([]);
    expect(updatedFiles[0].name).toBe("test_file.csv");
  });

  test("handles file input change event with valid file", () => {
    render(
      <UploadArea
        sectionTitle={sectionTitle}
        files={files}
        setFiles={setFiles}
        inputId={inputId}
      />
    );

    // Get the hidden file input by its id.
    const inputElement = document.getElementById(inputId) as HTMLInputElement;
    expect(inputElement).toBeInTheDocument();

    const file = new File(["content"], "another file.csv", {
      type: "text/csv",
    });

    fireEvent.change(inputElement, {
      target: { files: [file] },
    });

    expect(setFiles).toHaveBeenCalled();
    const updateFn = setFiles.mock.calls[0][0];
    const updatedFiles = updateFn([]);
    expect(updatedFiles[0].name).toBe("another_file.csv");
  });

  test("removes file when remove button is clicked", () => {
    // Start with one file already in the list.
    const file = new File(["content"], "file.csv", { type: "text/csv" });
    files = [file];

    render(
      <UploadArea
        sectionTitle={sectionTitle}
        files={files}
        setFiles={setFiles}
        inputId={inputId}
      />
    );

    // The remove button should be rendered for the file.
    const removeButton = screen.getByText(/remove/i);
    fireEvent.click(removeButton);

    expect(setFiles).toHaveBeenCalled();
    const updateFn = setFiles.mock.calls[0][0];
    const updatedFiles = updateFn(files);
    expect(updatedFiles).toHaveLength(0);
  });

  test("clicking on drop area triggers file input click", () => {
    render(
      <UploadArea
        sectionTitle={sectionTitle}
        files={files}
        setFiles={setFiles}
        inputId={inputId}
      />
    );

    const dropArea = screen
      .getByText(/Drag & drop your file here/i)
      .closest("div");
    const inputElement = document.getElementById(inputId) as HTMLInputElement;
    expect(inputElement).toBeInTheDocument();

    const clickSpy = jest.spyOn(inputElement, "click");

    fireEvent.click(dropArea!);
    expect(clickSpy).toHaveBeenCalled();
  });
});
