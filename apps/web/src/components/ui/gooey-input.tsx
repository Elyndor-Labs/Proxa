"use client";

import { useState, useRef, useEffect, useCallback, type ChangeEvent } from "react";
import { Search } from "lucide-react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";

export interface GooeyInputClassNames {
  root?: string;
  filterWrap?: string;
  buttonRow?: string;
  trigger?: string;
  input?: string;
  bubble?: string;
  bubbleSurface?: string;
}

export interface GooeyInputProps {
  placeholder?: string;
  className?: string;
  classNames?: GooeyInputClassNames;
  collapsedWidth?: number;
  expandedWidth?: number;
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  onOpenChange?: (open: boolean) => void;
  onSubmit?: () => void;
  disabled?: boolean;
}

const transition = {
  duration: 0.35,
  type: "spring" as const,
  bounce: 0.2,
};

/**
 * Header search — same surface as Login (fg fill / bg text), quiet focus, no outer glow.
 */
export function GooeyInput({
  placeholder = "Search markets…",
  className,
  classNames,
  collapsedWidth = 130,
  expandedWidth = 260,
  value: valueProp,
  defaultValue = "",
  onValueChange,
  onOpenChange,
  onSubmit,
  disabled = false,
}: GooeyInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const prevExpandedRef = useRef(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [uncontrolledValue, setUncontrolledValue] = useState(defaultValue);

  const isControlled = valueProp !== undefined;
  const searchText = isControlled ? valueProp : uncontrolledValue;

  const setSearchText = useCallback(
    (next: string) => {
      if (!isControlled) setUncontrolledValue(next);
      onValueChange?.(next);
    },
    [isControlled, onValueChange],
  );

  const setExpanded = useCallback(
    (next: boolean) => {
      setIsExpanded(next);
      onOpenChange?.(next);
    },
    [onOpenChange],
  );

  useEffect(() => {
    if (isExpanded) {
      inputRef.current?.focus();
    } else if (prevExpandedRef.current) {
      setSearchText("");
    }
    prevExpandedRef.current = isExpanded;
  }, [isExpanded, setSearchText]);

  const buttonVariants = {
    collapsed: { width: collapsedWidth },
    expanded: { width: expandedWidth },
  };

  const handleExpand = useCallback(() => {
    if (!disabled) setExpanded(true);
  }, [disabled, setExpanded]);

  const handleChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => setSearchText(e.target.value),
    [setSearchText],
  );

  const handleBlur = useCallback(() => {
    if (!searchText) setExpanded(false);
  }, [searchText, setExpanded]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        e.preventDefault();
        onSubmit?.();
      }
      if (e.key === "Escape") {
        setExpanded(false);
        inputRef.current?.blur();
      }
    },
    [onSubmit, setExpanded],
  );

  return (
    <div className={cn("relative flex items-center justify-end", className, classNames?.root)}>
      <motion.div
        className={cn("flex h-10 items-center", classNames?.buttonRow)}
        variants={buttonVariants}
        initial="collapsed"
        animate={isExpanded ? "expanded" : "collapsed"}
        transition={transition}
      >
        {isExpanded ? (
          <div
            className={cn(
              "nav-search-pill flex h-10 w-full items-center gap-2 px-4 text-sm font-semibold outline-none ring-0 ring-offset-0 [-webkit-tap-highlight-color:transparent]",
              classNames?.trigger,
            )}
          >
            <Search className="h-4 w-4 shrink-0" aria-hidden />
            <input
              ref={inputRef}
              type="search"
              enterKeyHint="search"
              autoComplete="off"
              value={searchText}
              onChange={handleChange}
              onBlur={handleBlur}
              onKeyDown={handleKeyDown}
              disabled={disabled}
              placeholder={placeholder}
              aria-label="Search markets"
              className={cn(
                "h-full min-w-0 flex-1 appearance-none border-0 bg-transparent text-sm font-semibold outline-none ring-0 ring-offset-0 placeholder:opacity-100 focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0 [&::-webkit-search-cancel-button]:hidden [&::-webkit-search-decoration]:hidden",
                classNames?.input,
              )}
            />
          </div>
        ) : (
          <button
            type="button"
            disabled={disabled}
            onClick={handleExpand}
            aria-label="Search markets"
            aria-expanded={false}
            className={cn(
              "nav-search-pill flex h-10 w-full cursor-pointer items-center gap-2 px-4 text-sm font-semibold outline-none ring-0 ring-offset-0 focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 disabled:pointer-events-none disabled:opacity-50 [-webkit-tap-highlight-color:transparent]",
              classNames?.trigger,
            )}
          >
            <Search className="h-4 w-4 shrink-0" aria-hidden />
            <span>Search</span>
          </button>
        )}
      </motion.div>
    </div>
  );
}
