export const SearchBar = ({ onSearch }: { onSearch: (val: string) => void }) => (
  <input
    placeholder="Tìm kiếm chức năng..."
    className="
      w-full max-w-md px-4 py-2 rounded-lg outline-none transition-all
      /* Màu sắc dựa trên biến CSS */
      bg-[var(--color-input-bg)] 
      border border-[var(--color-border-subtle)]
      text-[var(--color-foreground)]
      placeholder:text-[var(--color-text-muted)]
      
      /* Focus States */
      focus:border-[var(--color-sap-blue)] 
      focus:ring-1 
      focus:ring-[var(--color-sap-blue)]
    "
    onChange={(e) => onSearch(e.target.value)}
  />
);