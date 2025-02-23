import styled from '@emotion/styled';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import 'ag-grid-community/styles/ag-theme-balham.css';
import 'ag-grid-community/styles/ag-theme-material.css';
import 'ag-grid-enterprise';
import { Inspector } from 'components/inspector/Inspector';
import { memo } from 'react';
import { Tooltip } from 'react-tooltip';
import { GridPreview } from './GridPreview';
import { ParentThemeMenu } from './ParentThemeMenu';

export const RootContainer = memo(() => {
  return (
    <Container>
      <TopRow>
        <ParentThemeMenu />
      </TopRow>
      <Columns>
        <LeftColumn>
          <Inspector />
        </LeftColumn>
        <RightColumn>
          <GridPreview />
        </RightColumn>
      </Columns>
      <Tooltip
        id="theme-builder-tooltip"
        className="tooltip"
        place="top"
        anchorSelect="[data-tooltip-content]"
      />
    </Container>
  );
});

const Container = styled('div')`
  display: flex;
  flex-direction: column;
  height: 100%;
  gap: 20px;

  .tooltip {
    max-width: 400px;
  }
`;

const TopRow = styled('div')``;

const Columns = styled('div')`
  display: flex;
  flex: 1;

  .tooltip {
    max-width: 400px;
  }
`;

const LeftColumn = styled('div')`
  display: flex;
  flex-direction: column;
  flex: 1.5;
  min-width: 200px;
  max-width: 400px;
  margin-right: 20px;
  gap: 20px;
`;

const RightColumn = styled('div')`
  flex: 2.5;
  overflow-x: auto;
`;
