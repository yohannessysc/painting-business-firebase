import { Routes } from '@angular/router';

export const routes: Routes = [
	{
		path: '',
		loadComponent: () => import('./pages/home.page').then((m) => m.HomePage),
		title: 'Evolution Painting Solutions | Home'
	},
	{
		path: 'services',
		loadComponent: () => import('./pages/services.page').then((m) => m.ServicesPage),
		title: 'Evolution Painting Solutions | Services'
	},
	{
		path: 'process',
		loadComponent: () => import('./pages/process.page').then((m) => m.ProcessPage),
		title: 'Evolution Painting Solutions | Process'
	},
	{
		path: 'projects',
		loadComponent: () => import('./pages/projects.page').then((m) => m.ProjectsPage),
		title: 'Evolution Painting Solutions | Projects'
	},
	{
		path: 'contact',
		loadComponent: () => import('./pages/contact.page').then((m) => m.ContactPage),
		title: 'Evolution Painting Solutions | Contact'
	},
	{
		path: 'admin',
		loadComponent: () => import('./pages/admin.page').then((m) => m.AdminPage),
		title: 'Evolution Painting Solutions | Admin'
	},
	{ path: '**', redirectTo: '' }
];
