import { Routes } from '@angular/router';
import { TicketsPage } from './tickets';
import { TicketDetailPage } from './tickets-detail';
import { TicketFormPage } from './tickets-form';

export default [
  { path: '', component: TicketsPage, title: 'Tickets' },
  { path: 'new', component: TicketFormPage, title: 'Nuevo ticket' },
  { path: ':id', component: TicketDetailPage, title: 'Detalle de ticket' },
] as Routes;
