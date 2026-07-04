import { useMemo } from 'react';
import { AgStudio } from 'ag-studio-react';
import { AgReportState, studioTheme } from 'ag-studio';
import { useCO2Data } from '../../../../data/DataProvider';
import { AgStudio } from 'ag-studio-react';
import { studioTheme } from 'ag-studio';

const myTheme = studioTheme.withParams({
  backgroundColor: '#0e0f13',
  foregroundColor: '#e0e0e0',
});

const initialState: AgReportState = {
  pages: [
    {
      id: 'page-1',
      widgetLayout: {
        '6': {
          xTrack: 0,
          yTrack: 6,
          xSpan: 10,
          ySpan: 24,
        },
        '7': {
          xTrack: 10,
          yTrack: 6,
          xSpan: 14,
          ySpan: 12,
        },
        '8': {
          xTrack: 10,
          yTrack: 18,
          xSpan: 14,
          ySpan: 12,
        },
        '9': {
          xTrack: 0,
          yTrack: 0,
          xSpan: 24,
          ySpan: 6,
        },
        '10': {
          xTrack: 0,
          yTrack: 30,
          xSpan: 24,
          ySpan: 13,
        },
      },
      widgets: {
        '6': {
          type: 'bar-chart-stacked',
          dataMapping: {
            categoryKey: [
              {
                id: 'emissions.continent',
              },
            ],
            valueKey: [
              {
                id: 'emissions.cumulative_co2',
                aggregation: 'last',
              },
            ],
            tooltipKey: [
              {
                id: 'emissions.share_global_co2',
                aggregation: 'last',
              },
              {
                id: 'emissions.cumulative_co2',
                aggregation: 'last',
              },
            ],
            legendKey: [
              {
                id: 'emissions.country',
              },
            ],
          },
          format: {
            caption: {
              enabled: true,
              text: 'Largest polluters by continent',
            },
          },
        },
        '7': {
          type: 'line-chart',
          dataMapping: {
            categoryKey: [
              {
                id: 'emissions.date',
              },
            ],
            valueKey: [
              {
                id: 'emissions.co2',
                aggregation: 'avg',
              },
            ],
            tooltipKey: [],
          },
          format: {
            style: {
              theme: {
                common: {
                  zoom: {
                    enabled: true,
                    enableSelecting: false,
                    enableScrolling: true,
                  },
                  navigator: {
                    enabled: false,
                  },
                },
              },
              custom: {
                crosshair: {
                  enabled: false,
                },
              },
            },
            caption: {
              enabled: true,
              text: 'CO2 emissions',
            },
          },
        },
        '8': {
          type: 'line-chart',
          dataMapping: {
            categoryKey: [
              {
                id: 'emissions.date',
              },
            ],
            valueKey: [
              {
                id: 'emissions.population',
                aggregation: 'sum',
              },
            ],
            tooltipKey: [],
          },
          format: {
            caption: {
              enabled: true,
              text: 'Population growth',
            },
          },
        },
        '9': {
          type: 'date-filter',
          dataMapping: {
            value: [
              {
                id: 'emissions.date',
              },
            ],
          },
          format: {},
        },
        '10': {
          type: 'grid',
          dataMapping: {
            cols: [
              {
                id: 'emissions.country',
              },
              {
                id: 'emissions.continent',
              },
              {
                id: 'emissions.date',
              },
              {
                id: 'emissions.co2',
                aggregation: 'sum',
              },
              {
                id: 'emissions.co2_per_capita',
                aggregation: 'avg',
              },
              {
                id: 'emissions.share_global_co2',
                aggregation: 'sum',
              },
              {
                id: 'emissions.cumulative_co2',
                aggregation: 'sum',
              },
              {
                id: 'emissions.population',
                aggregation: 'sum',
              },
            ],
          },
          format: {},
          sort: [
            {
              field: {
                id: 'emissions.co2',
                aggregation: 'sum',
              },
              direction: 'desc',
            },
          ],
        },
      },
      filter: {
        page: [
          {
            field: {
              id: 'emissions.date',
            },
            view: {},
            model: {
              operator: 'between',
              value: ['1920-01-01T00:00:00.000Z', '2020-01-01T00:00:00.000Z'],
            },
            filterWidgetId: '9',
          },
        ],
        widget: {
          '6': [],
          '7': [],
          '8': [],
          '9': [],
          '10': [],
        },
      },
    },
  ],
  selectedPageId: 'page-1',
  version: '2.0.1',
  panels: {
    filters: {
      collapsed: false,
    },
  },
};

const myTheme = studioTheme.withParams({
  backgroundColor: '#0e0f13',
  foregroundColor: '#e0e0e0',
});

export default function AGStudio() {
  const { rows, status } = useCO2Data();

  const data = useMemo(
    () => ({
      description:
        'Annual CO₂ emissions by country: absolute and per-capita output, ' +
        'cumulative totals, share of the global total, and population.',
      sources: [
        {
          id: 'emissions',
          name: 'CO₂ emissions',
          data: rows as unknown as Record<
            string,
            string | number | Date | null
          >[],
        },
      ],
    }),
    [rows],
  );

  if (status !== 'ready') {
    return <div className="chart-panel">Studio — {status}</div>;
  }

  return (
    <AgStudio
      data={data}
      mode="edit"
      theme={myTheme}
      initialState={initialState}
      onStateUpdated={(s) => console.log(s)}
      style={{ height: '100%', width: '100%' }}
    />
  );
}
