import React, { useState, useRef } from "react";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

type ExpandableSectionProps = {
  title: string;
  description?: string;
  content: React.ReactNode;
};

const ExpandableSection: React.FC<ExpandableSectionProps> = ({
  title,
  description,
  content,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  const toggleSection = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div>
      {/* Title section */}
      <div
        className="cursor-pointer flex items-center justify-between text-lg mb-6"
        onClick={toggleSection}
      >
        <div>
          <h2>{title}</h2>
          <p className="text-slate-500 text-sm">{description}</p>
        </div>
        <ExpandMoreIcon />
      </div>

      {/* Content section */}
      <div
        ref={contentRef}
        className={`overflow-hidden transition-all duration-300 ease-out ${
          isOpen ? "max-h-screen" : "max-h-0"
        }`}
        style={{
          maxHeight: isOpen ? `${contentRef.current?.scrollHeight}px` : "0px",
        }}
      >
        {content}
      </div>
    </div>
  );
};

export default ExpandableSection;
