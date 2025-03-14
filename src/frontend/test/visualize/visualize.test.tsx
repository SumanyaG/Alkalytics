/// <reference types="@testing-library/jest-dom" />
import '@testing-library/jest-dom';
import React from 'react';
import { render, screen } from '@testing-library/react';
import { MockedProvider } from '@apollo/client/testing';
import DataVisualize, { FormDataContext } from '../../src/pages/DataVisualize';
import { jest, describe, test, expect, beforeEach } from '@jest/globals';
import { gql } from '@apollo/client';

const FILTER_COLLECTDATA = gql`
  query GetFilterCollectionData(
    $attributes: [String!]!
    $collection: String!
    $dates: [String]
    $analysis: Boolean
  ) {
    getFilterCollectionData(
      attributes: $attributes
      collection: $collection
      dates: $dates
      analysis: $analysis
    ) {
        data
        analysisRes
      }
    }
`;

declare global {
  namespace jest {
    interface Matchers<R> {
      toBeInTheDocument(): R;
    }
  }
}

// Mock ResizeObserver
class MockResizeObserver {
    observe = jest.fn();
    unobserve = jest.fn();
    disconnect = jest.fn();
}

global.ResizeObserver = MockResizeObserver;

type ScatterPlotProps = {
  data: any[];
  properties: {
    'graph title'?: string;
    'x label'?: string;
    'y label'?: string;
    [key: string]: any;
  };
  width?: number;
  height?: number;
  lineData?: any[];
};

// Mock components
jest.mock('../../src/components/graph/scatter-plot.tsx', () => ({
  __esModule: true,
  default: jest.fn((props:ScatterPlotProps) => (
    <div data-testid="scatter-plot">
      <h2>{props.properties['graph title']}</h2>
      <div>{props.properties['x label']}</div>
      <div>{props.properties['y label']}</div>
    </div>
  ))
}));

jest.mock('../../src/components/sidebar/GraphSideBar.tsx', () => ({
  __esModule: true,
  default: jest.fn(() => <div data-testid="graph-sidebar" />)
}));

describe('DataVisualize Component', () => {
  const defaultContext = {    
    selectedGraphType: 'scatter',
    setSelectedGraphType: jest.fn(),
    selectedDates: ['2023-01-01'],
    setSelectedDates: jest.fn(),
    selectedParamType: 'testType',
    setSelectedParamType: jest.fn(),
    selectedParamX: 'testX',
    setSelectedParamX: jest.fn(),
    selectedParamY: 'testY',
    setSelectedParamY: jest.fn(),
    timeMinX: '',
    setTimeMinX: jest.fn(),
    timeMaxX: '',
    setTimeMaxX: jest.fn(),
    timeMinY: '',
    setTimeMinY: jest.fn(),
    timeMaxY: '',
    setTimeMaxY: jest.fn(),
    minX: '',
    setMinX: jest.fn(),
    maxX: '',
    setMaxX: jest.fn(),
    minY: '',
    setMinY: jest.fn(),
    maxY: '',
    setMaxY: jest.fn(),
    graphTitle: 'Test Graph',
    setGraphTitle: jest.fn(),
    xLabel: 'X Axis',
    setXLabel: jest.fn(),
    yLabel: 'Y Axis',
    setYLabel: jest.fn(),
    submit: true,
    setSubmit: jest.fn(),
  };

  const mocks = [
    {
      request: {
        query: FILTER_COLLECTDATA,
        variables: {
          attributes: ['testX', 'testY'],
          collection: 'testType',
          dates: ['2023-01-01'],
          analysis: true
        },
      },
      result: {
        data: {
          getFilterCollectionData: {
            data: [
              { testX: '1', testY: '2' },
              { testX: '3', testY: '4' }
            ],
            analysisRes: [{ slope: 1, intercept: 0, R_squared: 0.8 }]
          }
        },
      },
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('Renders without crashing', () => {
    render(
      <MockedProvider mocks={[]} addTypename={false}>
        <FormDataContext.Provider value={defaultContext}>
          <DataVisualize />
        </FormDataContext.Provider>
      </MockedProvider>
    );
    
    expect(document.body).toBeTruthy();
  });

  test('Renders GraphSideBar component', () => {
    render(
      <MockedProvider mocks={[]} addTypename={false}>
        <FormDataContext.Provider value={defaultContext}>
          <DataVisualize />
        </FormDataContext.Provider>
      </MockedProvider>
    );
    
    expect(screen.getByTestId('graph-sidebar')).toBeTruthy();
  });

  test.skip('Renders correct graph type', async () => {
    render(
      <MockedProvider mocks={[]} addTypename={false}>
        <FormDataContext.Provider value={defaultContext}>
          <DataVisualize />
        </FormDataContext.Provider>
      </MockedProvider>
    );
    
    expect(screen.getByTestId('scatter-plot')).toBeTruthy();
  });

  test.skip('Renders with correct graph title', async () => {
    render(
      <MockedProvider mocks={[]} addTypename={false}>
        <FormDataContext.Provider value={defaultContext}>
          <DataVisualize />
        </FormDataContext.Provider>
      </MockedProvider>
    );
    
    expect(screen.getByText('Test Graph')).toBeTruthy();
  });

  test.skip('Renders with correct axis labels', async () => {
    render(
      <MockedProvider mocks={[]} addTypename={false}>
        <FormDataContext.Provider value={defaultContext}>
          <DataVisualize />
        </FormDataContext.Provider>
      </MockedProvider>
    );
    
    expect(screen.getByText('X Axis')).toBeTruthy();
    expect(screen.getByText('Y Axis')).toBeTruthy();
  });
});