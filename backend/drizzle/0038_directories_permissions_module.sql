-- Выносим право на справочники в отдельный модуль «Справочники»
UPDATE permissions
SET module = 'directories', name = 'Управление справочниками'
WHERE code = 'directories:manage';
