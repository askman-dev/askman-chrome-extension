import exampleThemeStorage from '@src/shared/storages/exampleThemeStorage';

async function toggleTheme() {
  await exampleThemeStorage.toggle();
}

void toggleTheme();
