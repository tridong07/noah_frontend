export const SearchBar = ({ onSearch }: { onSearch: (val: string) => void }) => (
  <input
    placeholder="Tìm kiếm chức năng..."
    className="mb-8 w-full max-w-md px-4 py-2 rounded-lg border border-slate-300 outline-none focus:ring-2 focus:ring-[#0a6ed1]"
    onChange={(e) => onSearch(e.target.value)}
  />
);