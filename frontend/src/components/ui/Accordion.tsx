"use client";

import * as React from "react";
import { ChevronDownIcon } from "lucide-react";

interface AccordionItemProps {
  title: string;
  children: React.ReactNode;
}

const styles = {
  item: {
    borderBottom: "1px solid #ddd",
  } as React.CSSProperties,
  trigger: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    padding: "12px 0",
    background: "none",
    border: "none",
    outline: "none",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: 500,
    textAlign: "left" as const,
    transition: "all 0.2s ease-in-out",
  } as React.CSSProperties,
  chevron: (open: boolean): React.CSSProperties => ({
    width: "16px",
    height: "16px",
    color: "#666",
    transform: open ? "rotate(180deg)" : "rotate(0)",
    transition: "transform 0.2s ease-in-out",
  }),
  content: (open: boolean): React.CSSProperties => ({
    maxHeight: open ? "200px" : "0",
    overflow: "hidden",
    transition: "max-height 0.25s ease-in-out",
    fontSize: "14px",
  }),
  contentInner: {
    padding: "8px 0",
  } as React.CSSProperties,
};

const AccordionItem: React.FC<AccordionItemProps> = ({ title, children }) => {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <div style={styles.item}>
      <button
        style={styles.trigger}
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
      >
        {title}
        <ChevronDownIcon style={styles.chevron(isOpen)} />
      </button>
      <div style={styles.content(isOpen)}>
        <div style={styles.contentInner}>{children}</div>
      </div>
    </div>
  );
};

interface AccordionProps {
  items: { title: string; content: React.ReactNode }[];
}

const Accordion: React.FC<AccordionProps> = ({ items }) => {
  return (
    <div>
      {items.map((item, index) => (
        <AccordionItem key={index} title={item.title}>
          {item.content}
        </AccordionItem>
      ))}
    </div>
  );
};

export { Accordion, AccordionItem };
