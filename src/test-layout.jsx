import { AppLayout } from './components/layout/AppLayout';

function TestLayout() {
  return (
    <AppLayout
      flowsPanel={
        <div style={{ padding: 20 }}>
          <h3>Flows Panel</h3>
          <ul>
            <li>Package 01</li>
            <li>Package 02</li>
          </ul>
        </div>
      }
      workspacePanel={
        <div style={{ padding: 20 }}>
          <h1>Workspace (Mapping Table)</h1>
          <p>This is where your mapping table will live</p>
        </div>
      }
      fieldsPanel={
        <div style={{ padding: 20 }}>
          <h3>Fields Browser</h3>
          <p>Field browser content here</p>
        </div>
      }
    />
  );
}

export default TestLayout;
