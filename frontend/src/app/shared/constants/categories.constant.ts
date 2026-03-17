/**
 * Campaign Category Codes
 * These match the backend enum values exactly.
 */
export enum CampaignCategory {
  ALL = 'ALL',
  HEALTH = 'HEALTH',
  EDUCATION = 'EDUCATION',
  HOUSING = 'HOUSING',
  FOOD = 'FOOD',
  EMERGENCY = 'EMERGENCY',
  ENVIRONMENT = 'ENVIRONMENT',
  COMMUNITY = 'COMMUNITY',
  DISABILITY = 'DISABILITY',
  CHILDREN = 'CHILDREN',
  CLOTHING = 'CLOTHING',
  OTHER = 'OTHER',
}

/**
 * Category Display Labels
 */
export const CAMPAIGN_CATEGORY_LABELS: Record<string, string> = {
  ALL: 'Toutes',
  HEALTH: 'Santé',
  EDUCATION: 'Éducation',
  HOUSING: 'Logement',
  FOOD: 'Alimentation',
  EMERGENCY: 'Urgence',
  ENVIRONMENT: 'Environnement',
  COMMUNITY: 'Communauté',
  DISABILITY: 'Handicap',
  CHILDREN: 'Enfants',
  CLOTHING: 'Vêtements',
  OTHER: 'Autres',
};

/**
 * Category Icons (emoji fallbacks for components that haven't migrated to SVG yet)
 */
export const CAMPAIGN_CATEGORY_ICONS: Record<string, string> = {
  HEALTH: '❤️',
  EDUCATION: '📚',
  HOUSING: '🏠',
  FOOD: '🍎',
  EMERGENCY: '🚨',
  ENVIRONMENT: '🌱',
  COMMUNITY: '👥',
  DISABILITY: '♿',
  CHILDREN: '🌟',
  CLOTHING: '👗',
  OTHER: '📦',
};

/**
 * Category Tailwind color classes
 */
export const CAMPAIGN_CATEGORY_COLORS: Record<string, string> = {
  HEALTH: 'bg-red-100 text-red-800',
  EDUCATION: 'bg-blue-100 text-blue-800',
  HOUSING: 'bg-amber-100 text-amber-800',
  FOOD: 'bg-orange-100 text-orange-800',
  EMERGENCY: 'bg-rose-100 text-rose-800',
  ENVIRONMENT: 'bg-green-100 text-green-800',
  COMMUNITY: 'bg-purple-100 text-purple-800',
  DISABILITY: 'bg-sky-100 text-sky-800',
  CHILDREN: 'bg-pink-100 text-pink-800',
  CLOTHING: 'bg-violet-100 text-violet-800',
  OTHER: 'bg-gray-100 text-gray-800',
};

/**
 * Get all categories as an array for dropdowns/filters
 */
export const getCategoriesArray = (): Array<{ code: string; label: string }> => {
  return Object.entries(CAMPAIGN_CATEGORY_LABELS).map(([code, label]) => ({
    code,
    label,
  }));
};
