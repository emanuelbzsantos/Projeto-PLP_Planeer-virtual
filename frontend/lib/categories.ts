export const CATEGORIES = [
  "Estudos",
  "Trabalho",
  "Saúde",
  "Pessoal",
  "Lazer",
] as const;

interface CategoryStyle {
  badgeClass: string;
  color: string;
  dotClass: string;
}

const DEFAULT_STYLE: CategoryStyle = {
  badgeClass: "bg-gray-100 text-gray-700",
  color: "#9ca3af",
  dotClass: "bg-gray-400",
};

const CATEGORY_STYLES: Record<string, CategoryStyle> = {
  Estudos: {
    badgeClass: "bg-blue-100 text-blue-700",
    color: "#3b82f6",
    dotClass: "bg-blue-500",
  },
  Trabalho: {
    badgeClass: "bg-purple-100 text-purple-700",
    color: "#a855f7",
    dotClass: "bg-purple-500",
  },
  Saúde: {
    badgeClass: "bg-green-100 text-green-700",
    color: "#22c55e",
    dotClass: "bg-green-500",
  },
  Pessoal: {
    badgeClass: "bg-orange-100 text-orange-700",
    color: "#f97316",
    dotClass: "bg-orange-500",
  },
  Lazer: {
    badgeClass: "bg-pink-100 text-pink-700",
    color: "#ec4899",
    dotClass: "bg-pink-500",
  },
};

export function getCategoryStyle(category: string): CategoryStyle {
  return CATEGORY_STYLES[category] ?? DEFAULT_STYLE;
}
