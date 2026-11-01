import React, { useState } from 'react';
import { SanadLayout, SanadTab } from './components/layout/SanadLayout';
import { ScheduleView } from './components/schedule/ScheduleView';
import { RecipientView } from './components/recipient/RecipientView';
import { AppointmentsView } from './components/appointments/AppointmentsView';
import { DocumentsView } from './components/documents/DocumentsView';
import { InboxView } from './components/inbox/InboxView';
import { AuditView } from './components/audit/AuditView';
import { sanadService } from './services/sanadService';

export default function App() {
  const [currentTab, setCurrentTab] = useState<SanadTab>('schedule');
  const [dataVersion, setDataVersion] = useState<number>(0);

  const refreshData = () => {
    setDataVersion(v => v + 1);
  };

  const circle = sanadService.getCircle();
  const recipient = sanadService.getRecipient();
  const activeMember = sanadService.getActiveMember();

  return (
    <SanadLayout
      currentTab={currentTab}
      onSelectTab={setCurrentTab}
      circle={circle}
      recipient={recipient}
      activeMember={activeMember}
      onMemberSwitched={refreshData}
    >
      {currentTab === 'schedule' && (
        <ScheduleView onDataChanged={refreshData} />
      )}

      {currentTab === 'recipient' && (
        <RecipientView onDataChanged={refreshData} />
      )}

      {currentTab === 'appointments' && (
        <AppointmentsView />
      )}

      {currentTab === 'documents' && (
        <DocumentsView onDataChanged={refreshData} />
      )}

      {currentTab === 'inbox' && (
        <InboxView onDataChanged={refreshData} />
      )}

      {currentTab === 'audit' && (
        <AuditView />
      )}
    </SanadLayout>
  );
}
