import pytest
import pandas as pd
import os
from datetime import datetime
import numpy as np
from unittest.mock import patch, MagicMock, AsyncMock
import asyncio

from services.migrationService import MigrationService

@pytest.fixture
def mock_motor_client():
    """Fixture to mock AsyncIOMotorClient and database collections"""
    with patch('motor.motor_asyncio.AsyncIOMotorClient') as mock_client:
        # Configure the mock client
        mock_db = MagicMock()
        mock_experiments = AsyncMock()
        mock_data = AsyncMock()
        
        # Set up the return structure
        mock_client.return_value.__getitem__.return_value = mock_db
        mock_db.__getitem__.side_effect = lambda x: mock_experiments if x == "experiments" else mock_data
        
        # Create a service with the mock
        service = MigrationService("mongodb://localhost:27017", "test_db")
        
        # Replace the collections with our mocks for easier access in tests
        service.experimentsCollection = mock_experiments
        service.dataSheetsCollection = mock_data
        
        # Add a close method to the mock client
        mock_client.return_value.close = MagicMock()
        service.client = mock_client.return_value
        
        yield service, mock_experiments, mock_data

@pytest.fixture
def sample_experiment_df():
    """Fixture to create a sample experiment DataFrame"""
    # Create multi-level column headers similar to the Excel file
    columns = pd.MultiIndex.from_tuples([
        ('Date', ''),
        ('#', ''),
        ('Operator', ''),
        ('Temperature (°C)', 'Target'),
        ('Temperature (°C)', 'Actual'),
        ('Pressure (Bar)', ''),
        ('Notes', '')
    ])
    
    # Create sample data
    data = [
        [pd.Timestamp('2023-05-01'), 1, 'John', 25, 24.5, 1.01, 'First test'],
        [pd.Timestamp('2023-05-02'), 2, 'Jane', 30, 29.8, 1.02, 'Second test'],
        [pd.Timestamp('2023-05-03'), 3, 'Bob', 35, 34.7, 1.03, 'Third test']
    ]
    
    df = pd.DataFrame(data, columns=columns)
    return df

@pytest.fixture
def sample_data_df():
    """Fixture to create a sample data sheet DataFrame"""
    # Create columns similar to data sheets
    columns = ['#', 'Time', 'Temperature', 'Pressure', 'Humidity']
    
    # Create sample data
    time_base = pd.Timestamp('2023-05-01 09:00:00')
    data = [
        [1, time_base, 24.5, 1.01, 45],
        [2, time_base + pd.Timedelta(minutes=15), 24.8, 1.02, 46],
        [3, time_base + pd.Timedelta(minutes=30), 25.1, 1.03, 47],
    ]
    
    df = pd.DataFrame(data, columns=columns)
    return df

@pytest.mark.asyncio
async def test_clean_data(mock_motor_client):
    """Test the cleanData method properly removes empty rows and columns"""
    service, _, _ = mock_motor_client
    
    # Create a DataFrame with NaN values and zero rows
    df = pd.DataFrame({
        'A': [1, 2, np.nan, 4],
        'B': [5, 6, 7, 8],
        'C': [np.nan, np.nan, np.nan, np.nan],
        'D': [0, 0, 0, 0]
    })
    
    # Add a row with all zeros
    df.loc[4] = [0, 0, 0, 0]
    
    cleaned_df = service.cleanData(df)
    
    # Check that rows with all NaN values are removed
    assert cleaned_df.shape[0] == 4  # One row less than original
    
    # Check that the all-zero row was removed
    assert 4 not in cleaned_df.index

@pytest.mark.asyncio
async def test_is_exp_duplicate(mock_motor_client):
    """Test isExpDuplicate method returns correct boolean based on DB search"""
    service, mock_experiments, _ = mock_motor_client
    
    # Configure mock to return None (no duplicate)
    mock_experiments.find_one.return_value = None
    result1 = await service.isExpDuplicate("exp1")
    assert result1 is False
    
    # Configure mock to return a document (duplicate exists)
    mock_experiments.find_one.return_value = {"experimentId": "exp1"}
    result2 = await service.isExpDuplicate("exp1")
    assert result2 is True
    
    # Verify the correct query was used
    mock_experiments.find_one.assert_called_with({"experimentId": "exp1"})

@pytest.mark.asyncio
async def test_find_experiment_single_match(mock_motor_client):
    """Test findExperiment when exactly one experiment matches the date"""
    service, mock_experiments, _ = mock_motor_client
    
    # Mock the find method to return a cursor with a mocked to_list coroutine
    mock_cursor = MagicMock()
    mock_cursor.to_list = AsyncMock(return_value=[
        {"experimentId": "exp1", "Date": "2023-05-01"}
    ])
    mock_experiments.find = MagicMock(return_value=mock_cursor)
    
    result = await service.findExperiment("2023-05-01", "data1.xlsx")
    assert result == "exp1"
    mock_experiments.find.assert_called_with({"Date": "2023-05-01"})

@pytest.mark.asyncio
async def test_find_experiment_multiple_matches(mock_motor_client):
    """Test findExperiment when multiple experiments match the date"""
    service, mock_experiments, _ = mock_motor_client
    
    # Mock the find method to return a cursor with multiple results
    mock_cursor = MagicMock()
    mock_cursor.to_list = AsyncMock(return_value=[
        {"experimentId": "exp1", "Date": "2023-05-01"},
        {"experimentId": "exp2", "Date": "2023-05-01"}
    ])
    mock_experiments.find = MagicMock(return_value=mock_cursor)
    
    result = await service.findExperiment("2023-05-01", "data1.xlsx")
    assert result is None
    assert len(service.ambiguousData) == 1
    assert service.ambiguousData[0]["dataId"] == "data1.xlsx"
    assert service.ambiguousData[0]["matchingExp"] == ["exp1", "exp2"]

@pytest.mark.asyncio
async def test_find_experiment_no_matches(mock_motor_client):
    """Test findExperiment when no experiments match the date"""
    service, mock_experiments, _ = mock_motor_client
    
    # Mock the find method to return an empty cursor
    mock_cursor = MagicMock()
    mock_cursor.to_list = AsyncMock(return_value=[])
    mock_experiments.find = MagicMock(return_value=mock_cursor)
    
    result = await service.findExperiment("2023-05-01", "data1.xlsx")
    assert result is None
    assert len(service.ambiguousData) == 0

@pytest.mark.asyncio
async def test_import_experiment_sheet(mock_motor_client, sample_experiment_df):
    """Test importExperimentSheet with mocked Excel reading"""
    service, mock_experiments, _ = mock_motor_client
    
    # Configure mocks
    with patch('pandas.read_excel', return_value=sample_experiment_df):
        with patch.object(service, 'cleanData', return_value=sample_experiment_df):
            with patch.object(service, 'isExpDuplicate', new_callable=AsyncMock) as mock_is_duplicate:
                # Set first experiment as duplicate, others as new
                mock_is_duplicate.side_effect = [True, False, False]
                
                # Mock insert_many to avoid actual DB insertion
                mock_experiments.insert_many = AsyncMock()
                
                # Call the method
                await service.importExperimentSheet("test_experiment.xlsx")
                
                # Check that insert_many was called with correct data (excluding duplicate)
                args = mock_experiments.insert_many.call_args[0][0]
                assert len(args) == 2  # Two non-duplicate experiments
                assert args[0]["experimentId"] == "#2 2023-05-02"
                assert args[1]["experimentId"] == "#3 2023-05-03"

@pytest.mark.asyncio
async def test_link_data(mock_motor_client, sample_data_df):
    """Test linkData creates proper data documents with experiment links"""
    service, _, _ = mock_motor_client
    
    records = await service.linkData(sample_data_df, "test_experiment_id")
    
    assert len(records) == 3
    for record in records:
        assert "dataSheetId" in record
        assert record["experimentId"] == "test_experiment_id"
        assert "Temperature" in record
        assert "Pressure" in record

@pytest.mark.asyncio
async def test_import_data_sheet_with_match(mock_motor_client, sample_data_df):
    """Test importDataSheet when a matching experiment is found"""
    service, _, mock_data = mock_motor_client
    
    # Configure mocks
    with patch('pandas.read_excel', return_value=sample_data_df):
        with patch.object(service, 'cleanData', return_value=sample_data_df):
            with patch.object(service, 'findExperiment', new_callable=AsyncMock) as mock_find_exp:
                # Set up a matching experiment
                mock_find_exp.return_value = "matched_experiment_id"
                
                # Mock link_data to return sample records
                with patch.object(service, 'linkData', new_callable=AsyncMock) as mock_link_data:
                    sample_records = [
                        {"dataSheetId": "data1", "experimentId": "matched_experiment_id"},
                        {"dataSheetId": "data2", "experimentId": "matched_experiment_id"}
                    ]
                    mock_link_data.return_value = sample_records
                    
                    # Mock insert_many to avoid actual DB insertion
                    mock_data.insert_many = AsyncMock()
                    
                    # Call the method
                    await service.importDataSheet("test_data.xlsx")
                    
                    # Verify correct data was sent to insert_many
                    mock_data.insert_many.assert_called_once_with(sample_records)

@pytest.mark.asyncio
async def test_import_data_sheet_no_match(mock_motor_client, sample_data_df):
    """Test importDataSheet when no matching experiment is found"""
    service, _, mock_data = mock_motor_client
    
    # Configure mocks
    with patch('pandas.read_excel', return_value=sample_data_df):
        with patch.object(service, 'cleanData', return_value=sample_data_df):
            with patch.object(service, 'findExperiment', new_callable=AsyncMock) as mock_find_exp:
                # Set up no matching experiment
                mock_find_exp.return_value = None
                
                # Call the method
                result = await service.importDataSheet("test_data.xlsx")
                
                # Verify no insertion was attempted
                mock_data.insert_many.assert_not_called()
                assert result is None

@pytest.mark.asyncio
async def test_migrate(mock_motor_client):
    """Test migrate orchestrates the import of experiments and data correctly"""
    service, _, _ = mock_motor_client
    
    # Mock the import methods
    with patch.object(service, 'importExperimentSheet', new_callable=AsyncMock) as mock_import_exp:
        with patch.object(service, 'importDataSheet', new_callable=AsyncMock) as mock_import_data:
            # Set up ambiguous data for return
            service.ambiguousData = [
                {"dataId": "data1.xlsx", "matchingExp": ["exp1", "exp2"]}
            ]
            
            # Call migrate with sample file paths
            exp_paths = ["exp1.xlsx", "exp2.xlsx"]
            data_paths = ["data1.xlsx", "data2.xlsx"]
            result = await service.migrate(exp_paths, data_paths)
            
            # Verify methods were called with correct paths
            assert mock_import_exp.call_count == 2
            mock_import_exp.assert_any_call("exp1.xlsx")
            mock_import_exp.assert_any_call("exp2.xlsx")
            
            assert mock_import_data.call_count == 2
            mock_import_data.assert_any_call("data1.xlsx")
            mock_import_data.assert_any_call("data2.xlsx")
            
            # Verify ambiguous data was returned
            assert len(result) == 1
            assert result[0]["dataId"] == "data1.xlsx"

@pytest.mark.asyncio
async def test_close_connection(mock_motor_client):
    """Test closeConnection method properly closes the MongoDB client"""
    service, _, _ = mock_motor_client
    
    # Call the method
    await service.closeConnection()
    
    # Verify close was called
    service.client.close.assert_called_once()

@pytest.mark.asyncio
async def test_import_experiment_sheet_exception(mock_motor_client):
    """Test importExperimentSheet handles exceptions gracefully"""
    service, mock_experiments, _ = mock_motor_client
    
    # Configure pandas.read_excel to raise an exception
    with patch('pandas.read_excel', side_effect=Exception("Test error")):
        with patch('logging.error') as mock_log_error:
            # Call the method
            result = await service.importExperimentSheet("test_experiment.xlsx")
            
            # Verify error was logged
            mock_log_error.assert_called_once()
            assert "test_experiment.xlsx" in mock_log_error.call_args[0][0]
            assert "Test error" in mock_log_error.call_args[0][0]
            
            # Verify no insertion was attempted
            mock_experiments.insert_many.assert_not_called()
            assert result == []

@pytest.mark.asyncio
async def test_import_data_sheet_exception(mock_motor_client):
    """Test importDataSheet handles exceptions gracefully"""
    service, _, mock_data = mock_motor_client
    
    # Configure pandas.read_excel to raise an exception
    with patch('pandas.read_excel', side_effect=Exception("Test error")):
        with patch('logging.error') as mock_log_error:
            # Call the method
            result = await service.importDataSheet("test_data.xlsx")
            
            # Verify error was logged
            mock_log_error.assert_called_once()
            assert "test_data.xlsx" in mock_log_error.call_args[0][0]
            assert "Test error" in mock_log_error.call_args[0][0]
            
            # Verify no insertion was attempted
            mock_data.insert_many.assert_not_called()
            assert result is None