# 🖥️ Front-end PcPedia

A modern Angular application designed to simulate a client portal for PcPedia.  
It integrates a fake backend using **JSON Server** and visual dashboards powered by **Chart.js** and **ng2-charts**.

---

## 🚀 Overview

This project provides a modular architecture with sections such as:
- **Home** → Displays KPIs and charts with live data from the JSON database.
- **Contracts** → Lists active service contracts with modal detail views.
- **Profile** → Shows user information with multilingual support.
- **Shop** → Displays available equipment for purchase, connected to a shopping cart.

All data is managed through a local `db.json` file that acts as a REST API using **JSON Server**.

---

## ⚙️ Installation

### 1️⃣ Clone the repository
```bash
git clone https://github.com/1ASI0729-7401-2520-EcatLeasing-PcPedia/Front-end-PcPedia.git
cd Front-end-PcPedia
2️⃣ Install dependencies
bash
Copiar código
npm install
3️⃣ Run the local API
bash
Copiar código
npx json-server --watch db.json --port 3000
This will start a fake REST API at:

arduino
Copiar código
http://localhost:3000/
Available endpoints:

/users

/contratos

/productos

/carrito

🧩 Data Consumption (API)
Angular uses the HttpClient module to fetch data dynamically from JSON Server.

Example service (contracts.service.ts):

typescript
Copiar código
@Injectable({ providedIn: 'root' })
export class ContractsService {
  private apiUrl = 'http://localhost:3000/contratos';

  constructor(private http: HttpClient) {}

  getContractsByEmpresa(empresaId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}?empresaId=${empresaId}`);
  }

  getContractById(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }
}
Usage in a component:

typescript
Copiar código
ngOnInit() {
  this.contractsService.getContractsByEmpresa(user.id).subscribe(data => {
    this.contratos = data;
  });
}
📊 Data Visualization (Charts)
The Home Dashboard uses Chart.js and ng2-charts to display interactive statistics.

Installation
bash
Copiar código
npm install chart.js ng2-charts
Example Component (home.ts)
typescript
Copiar código
import { ChartData, ChartOptions } from 'chart.js';

barChartData: ChartData<'bar'> = {
  labels: [],
  datasets: [{ label: 'Devices', data: [], backgroundColor: '#1976d2' }]
};

pieChartData: ChartData<'pie'> = {
  labels: [],
  datasets: [{ data: [], backgroundColor: ['#1976d2', '#4caf50', '#ff9800'] }]
};

ngOnInit() {
  this.contractsService.getContractsByEmpresa(user.id).subscribe(contracts => {
    const models: Record<string, number> = {};
    const types: Record<string, number> = {};

    contracts.forEach(c => {
      c.detalles.forEach((d: any) => {
        types[d.tipo] = (types[d.tipo] || 0) + d.modelos.reduce((sum: number, m: any) => sum + m.cantidad, 0);
        d.modelos.forEach((m: any) => {
          models[m.nombre] = (models[m.nombre] || 0) + m.cantidad;
        });
      });
    });

    this.barChartData.labels = Object.keys(models);
    this.barChartData.datasets[0].data = Object.values(models);

    this.pieChartData.labels = Object.keys(types);
    this.pieChartData.datasets[0].data = Object.values(types);
  });
}
Example Template (home.html)
html
Copiar código
<div class="dashboard">
  <div class="kpis">
    <div class="kpi-card">
      <h3>Active Contracts</h3>
      <p>{{ activeContracts }}</p>
    </div>
    <div class="kpi-card">
      <h3>Total Devices</h3>
      <p>{{ totalDevices }}</p>
    </div>
    <div class="kpi-card">
      <h3>Total Incidents</h3>
      <p>{{ totalIncidents }}</p>
    </div>
  </div>

  <div class="charts">
    <div class="chart">
      <h3>Devices by Model</h3>
      <canvas baseChart [data]="barChartData" [options]="barChartOptions" chartType="bar"></canvas>
    </div>

    <div class="chart">
      <h3>Devices by Type</h3>
      <canvas baseChart [data]="pieChartData" [options]="pieChartOptions" chartType="pie"></canvas>
    </div>
  </div>
</div>
🌍 Internationalization (i18n)
Translations are handled via ngx-translate, with files stored in:

bash
Copiar código
/public/i18n/en.json
/public/i18n/es.json
Each component accesses translations via the TranslateService pipe:

html
Copiar código
<h3>{{ 'profile.title' | translate }}</h3>
Example usage in a service:

typescript
Copiar código
translate.use('en'); // or 'es'
🛍️ Shop Module (Marketplace)
The Shop section lists available products using the same API logic as contracts:

Products are displayed as cards.

Each card opens a modal with detailed specs.

Users can add items to their cart (/carrito).

🧠 Technologies Used
Technology	Purpose
Angular 17+	Frontend framework
JSON Server	Fake REST API
HttpClient	Data fetching
Chart.js / ng2-charts	Data visualization
ngx-translate	Internationalization
Bootstrap / Angular Material	UI components

📁 Project Structure
bash
Copiar código
src/
 ├── app/
 │   ├── core/               # Guards, services, models
 │   ├── features/           # Main features (login, shop, contracts)
 │   ├── shared/
 │   │   ├── components/     # Layout, toolbar, switcher
 │   │   └── views/          # View pages
 ├── assets/
 └── public/i18n/            # Translation files
👨‍💻 Author
Sebastián Hernández
Frontend Developer — PcPedia / 386 SMART
📧 sebastianehp@gmail.com
