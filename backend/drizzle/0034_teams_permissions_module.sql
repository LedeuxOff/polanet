-- Миграция: права на бригады выносятся в отдельный модуль «teams»
UPDATE permissions SET module = 'teams' WHERE code IN ('teams:list', 'teams:detail', 'teams:manage');
