import { useState, useMemo } from "react";
import { 
  List, 
  Plus, 
  Edit, 
  Trash, 
  Calendar,
  X,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  CheckCircle,
} from "lucide-react";
import {
  TableContainer,
  DataTable,
  TableTitle,
  TableHeader,
  TableHeadCellStyled,
  TableRow,
  TableCell,
  Loading,
  NoDataMessage,
  ButtonSearch,
  ViewToggleButton,
  SortableHeader,
  HeaderContent,
  Tooltip,
  ActionsContainer,
  DateCell,
  ActionButton,
  ClickableTableRow,
  ActionsTableCell,
} from "@/styles/table-styles";
import Pagination from "@/components/pagination";
import MissionCalendar from "./calendar";
import { StatusBadge } from "@/components/status";
import type { Status } from "@/components/status";
import type { Mission } from "@/api/mission/services";
import { 
  MissionStatusEnum, 
  normalizeMissionStatus,
  useCloseMission,
  useDeleteMissionWithUserId,
} from "@/api/mission/services";
import { useMissionReports } from "@/api/mission/report/services";
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

type SortField = 'employee' | 'mission' | 'type' | 'lieu' | 'status' | 'startDate' | 'endDate';
type SortOrder = 'asc' | 'desc' | null;

interface MissionTableProps {
  missions: Mission[];
  isSearchLoading: boolean;
  appliedFilters: any;
  page: number;
  pageSize: number;
  totalCount: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  canAddMission: boolean;
  canViewDetails: boolean;
  canEditMission: boolean;
  canCancelMission: boolean;
  canDeleteMission: boolean;
  canCloseMission: boolean;
  validatedMissions: Record<string, boolean>;
  hasActions: boolean;
  finalStatuses: Set<MissionStatusEnum>;
  getStatus: (status: MissionStatusEnum) => Status;
  onRowClick: (missionId: string) => void;
  onEditClick: (missionId: string) => void;
  onCancelClick: (mission: Mission) => void;
  onDeleteClick: (mission: Mission) => void;
  onCloseClick?: (mission: Mission) => void;
  onAddMission: () => void;
  userId?: string;
}

const MissionTable: React.FC<MissionTableProps> = ({
  missions,
  isSearchLoading,
  appliedFilters,
  page,
  pageSize,
  totalCount,
  onPageChange,
  onPageSizeChange,
  canAddMission,
  canViewDetails,
  canEditMission,
  canCancelMission,
  canDeleteMission,
  canCloseMission = false,
  validatedMissions,
  hasActions: originalHasActions,
  finalStatuses,
  getStatus,
  onRowClick,
  onEditClick,
  onCancelClick,
  onDeleteClick,
  onCloseClick,
  onAddMission,
  userId = "",
}) => {
  const [viewMode, setViewMode] = useState<'table' | 'calendar'>('table');
  const [sortField, setSortField] = useState<SortField | null>(null);
  const [sortOrder, setSortOrder] = useState<SortOrder>(null);
  const [hoveredContent] = useState<{text: string; x: number; y: number} | null>(null);
  const { mutate: closeMission, isPending: isClosing } = useCloseMission();
  const { isPending: isDeleting } = useDeleteMissionWithUserId();
  const { data: allReportsResponse } = useMissionReports();

  // Créer un Map des rapports par mission ID pour vérification rapide
  const reportsByMissionId = useMemo(() => {
    const map = new Map<string, boolean>();
    if (allReportsResponse?.data) {
      allReportsResponse.data.forEach((report: any) => {
        if (report.missionId) {
          map.set(report.missionId.trim(), true);
        }
      });
    }
    return map;
  }, [allReportsResponse]);

  // Calculer si nous avons besoin d'afficher des actions
  const hasActions = useMemo(() => {
    // Si hasActions est déjà true, on l'utilise
    if (originalHasActions) return true;
    
    // Sinon, vérifier si des actions sont possibles sur au moins une mission
    return missions.some(mission => {
      const normalizedStatus = normalizeMissionStatus(mission.status);
      const isCompleted = normalizedStatus === MissionStatusEnum.Completed;
      const isClosed = normalizedStatus === MissionStatusEnum.Closed;
      
      // Vérifier si on peut clôturer
      if (isCompleted && canCloseMission && !isClosed) {
        return true;
      }
      
      const isCanceledOrRejected = normalizedStatus === MissionStatusEnum.Canceled || 
                                  normalizedStatus === MissionStatusEnum.MissionRejected;
      
      // Vérifier si on peut supprimer
      if (isCanceledOrRejected && canDeleteMission) {
        return true;
      }
      
      const isFinal = finalStatuses.has(normalizedStatus);
      // Vérifier si on peut modifier ou annuler
      if (!isFinal && (canEditMission || canCancelMission)) {
        return true;
      }
      
      return false;
    });
  }, [missions, originalHasActions, canCloseMission, canDeleteMission, canEditMission, canCancelMission, finalStatuses]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      if (sortOrder === 'asc') {
        setSortOrder('desc');
      } else if (sortOrder === 'desc') {
        setSortOrder(null);
        setSortField(null);
      }
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <ArrowUpDown size={14} style={{ opacity: 0.5 }} />;
    }
    if (sortOrder === 'asc') {
      return <ArrowUp size={14} />;
    }
    if (sortOrder === 'desc') {
      return <ArrowDown size={14} />;
    }
    return <ArrowUpDown size={14} style={{ opacity: 0.5 }} />;
  };

  const sortedMissions = useMemo(() => {
    if (!sortField || !sortOrder) {
      return missions;
    }

    return [...missions].sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (sortField) {
        case 'employee':
          aValue = `${a.employee.firstName} ${a.employee.lastName}`.toLowerCase();
          bValue = `${b.employee.firstName} ${b.employee.lastName}`.toLowerCase();
          break;
        case 'mission':
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case 'type':
          aValue = a.missionType;
          bValue = b.missionType;
          break;
        case 'lieu':
          aValue = a.lieu.nom.toLowerCase();
          bValue = b.lieu.nom.toLowerCase();
          break;
        case 'status':
          aValue = normalizeMissionStatus(a.status);
          bValue = normalizeMissionStatus(b.status);
          break;
        case 'startDate':
          aValue = new Date(a.startDate).getTime();
          bValue = new Date(b.startDate).getTime();
          break;
        case 'endDate':
          aValue = new Date(a.endDate).getTime();
          bValue = new Date(b.endDate).getTime();
          break;
        default:
          return 0;
      }

      if (aValue < bValue) {
        return sortOrder === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortOrder === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }, [missions, sortField, sortOrder]);

  const formatDate = (date: Date) => {
    return format(date, 'dd/MM/yy', { locale: fr });
  };

  const handleRowClick = (missionId: string) => {
    if (canViewDetails) {
      onRowClick(missionId);
    }
  };

  const handleActionClick = (e: React.MouseEvent, callback: Function, ...args: any[]) => {
    e.stopPropagation();
    e.preventDefault();
    callback(...args);
  };

  const handleCloseClick = (e: React.MouseEvent, mission: Mission) => {
    e.stopPropagation();
    e.preventDefault();
    
    // MODIFICATION IMPORTANTE: Vérifier si un rapport existe avant de clôturer
    const hasReport = reportsByMissionId.has(mission.missionId);
    
    if (!hasReport) {
      alert("Impossible de clôturer la mission: aucun rapport n'a été soumis. Veuillez d'abord soumettre un rapport de mission.");
      return;
    }
    
    if (onCloseClick) {
      onCloseClick(mission);
    } else if (userId && canCloseMission) {
      closeMission({ missionId: mission.missionId, userId });
    }
  };

  // Fonctions utilitaires pour vérifier les statuts
  const isCanceledStatus = (status: any): boolean => {
    return normalizeMissionStatus(status) === MissionStatusEnum.Canceled;
  };

  const isRejectedStatus = (status: any): boolean => {
    return normalizeMissionStatus(status) === MissionStatusEnum.MissionRejected;
  };

  const isCompletedStatus = (status: any): boolean => {
    return normalizeMissionStatus(status) === MissionStatusEnum.Completed;
  };

  const isFinalStatus = (status: any): boolean => {
    return finalStatuses.has(normalizeMissionStatus(status));
  };

  const isClosedStatus = (status: any): boolean => {
    return normalizeMissionStatus(status) === MissionStatusEnum.Closed;
  };

  // Fonction simplifiée pour déterminer quelles actions afficher
  const getAvailableActions = (
    status: any, 
    isValidated: boolean,
    missionId: string
  ): {
    showDelete: boolean;
    showEdit: boolean;
    showCancel: boolean;
    showClose: boolean;
  } => {
    const isCanceledOrRejected = isCanceledStatus(status) || isRejectedStatus(status);
    const isFinal = isFinalStatus(status);
    const isCompleted = isCompletedStatus(status);
    const isClosed = isClosedStatus(status);

    // Cas 1: Mission annulée ou rejetée
    if (isCanceledOrRejected) {
      return {
        showDelete: !isValidated && canDeleteMission,
        showEdit: false,
        showCancel: false,
        showClose: false,
      };
    }
    
    // Cas 2: Mission déjà clôturée
    if (isClosed) {
      return {
        showDelete: false,
        showEdit: false,
        showCancel: false,
        showClose: false,
      };
    }
    
    // Cas 3: Mission terminée (peut être clôturée)
    // MODIFICATION: On vérifie si un rapport existe avant de permettre la clôture
    if (isCompleted && canCloseMission) {
      const hasReport = reportsByMissionId.has(missionId);
      return {
        showDelete: false,
        showEdit: false,
        showCancel: false,
        showClose: hasReport, // Seulement si un rapport existe
      };
    }
    
    // Cas 4: Mission non terminée, non clôturée
    return {
      showDelete: false,
      showEdit: !isFinal && !isValidated && canEditMission,
      showCancel: !isFinal && !isValidated && canCancelMission,
      showClose: false,
    };
  };

  const shouldShowActions = (
    status: any, 
    isValidated: boolean,
    missionId: string
  ): boolean => {
    const actions = getAvailableActions(status, isValidated, missionId);
    return actions.showDelete || actions.showEdit || actions.showCancel || actions.showClose;
  };

  const columnsConfig = useMemo(() => [
    { key: 'employee', label: 'Collaborateur', sortable: true, width: '13%' },
    { key: 'mission', label: 'Mission', sortable: true, width: '23%' },
    { key: 'type', label: 'Type', sortable: false, width: '8%' },
    { key: 'lieu', label: 'Lieu', sortable: false, width: '12%' },
    { key: 'status', label: 'Statut', sortable: false, width: '18%' },
    { key: 'startDate', label: 'Date Début', sortable: true, width: '10%' },
    { key: 'endDate', label: 'Date Fin', sortable: true, width: '10%' },
  ], []);

  const columnWidths = useMemo(() => {
    const widths = columnsConfig.map(col => col.width);
    if (hasActions) {
      widths.push('10%');
    }
    return widths;
  }, [columnsConfig, hasActions]);

  const renderCellContent = (content: string, isImportant: boolean = false) => {
    return (
      <div 
        style={{
          maxHeight: `${(isImportant ? 3 : 2) * 1.5}em`,
          overflow: 'hidden',
          lineHeight: '1.5em',
          display: '-webkit-box',
          WebkitLineClamp: (isImportant ? 3 : 2),
          WebkitBoxOrient: 'vertical',
          textOverflow: 'ellipsis',
        }}
      >
        {content}
      </div>
    );
  };

  const renderStatus = (status: Status) => {
    return (
      <div
        style={{
          width: '100%',
          minHeight: '20px', 
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '0', 
          margin: '0', 
        }}
      >
        <StatusBadge status={status} />
      </div>
    );
  };

  const headers = useMemo(() => {
    const baseHeaders = columnsConfig.map((column) => {
      if (column.sortable) {
        return (
          <SortableHeader 
            key={column.key} 
            onClick={() => handleSort(column.key as SortField)}
          >
            <HeaderContent>
              <span style={{ fontSize: '14px' }}>
                {column.label}
              </span>
              {getSortIcon(column.key as SortField)}
            </HeaderContent>
          </SortableHeader>
        );
      } else {
        return (
          <HeaderContent key={column.key}>
            <span style={{ fontSize: '14px' }}>
              {column.label}
            </span>
          </HeaderContent>
        );
      }
    });

    if (hasActions) {
      baseHeaders.push(
        <HeaderContent
          key="actions"
          style={{
            justifyContent: 'center',
            width: '100%',
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <span style={{ fontSize: '14px' }}>Actions</span>
        </HeaderContent>
      );
    }

    return baseHeaders;
  }, [columnsConfig, hasActions, sortField, sortOrder]);

  const hasAppliedFilters = useMemo(() => {
    return Object.values(appliedFilters).some((val) => {
      if (Array.isArray(val)) {
        return val.length > 0;
      }
      if (typeof val === 'string') {
        return val.trim() !== "";
      }
      if (val !== null && val !== undefined) {
        return true;
      }
      return false;
    });
  }, [appliedFilters]);

  return (
    <TableContainer>
      <TableHeader>
        <div style={{ display: "flex", alignItems: "center", gap: "var(--spacing-lg)" }}>
          <TableTitle style={{ fontSize: '18px' }}>
            {viewMode === 'table' ? 'Liste' : 'Calendrier'}
          </TableTitle>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "var(--spacing-sm)" }}>
          <ViewToggleButton
            onClick={() => setViewMode('table')}
            $isActive={viewMode === 'table'}
            title="Afficher le tableau"
            style={{ padding: '8px' }}
          >
            <List size={16} />
          </ViewToggleButton>
          
          <ViewToggleButton
            onClick={() => setViewMode('calendar')}
            $isActive={viewMode === 'calendar'}
            title="Afficher le calendrier"
            style={{ padding: '8px' }}
          >
            <Calendar size={16} />
          </ViewToggleButton>
          
          {canAddMission && (
            <ButtonSearch 
              title="Ajouter une mission" 
              onClick={onAddMission}
            >
              <Plus size={16} style={{ marginRight: "var(--spacing-sm)" }} />
              Ajouter
            </ButtonSearch>
          )}
        </div>
      </TableHeader>

      {viewMode === 'table' ? (
        <div className="table-wrapper" style={{ overflowX: "auto", maxWidth: "100%", position: "relative" }}>
          <DataTable style={{ tableLayout: 'fixed', width: '100%' }}>
            <thead>
              <tr>
                {headers.map((header, index) => (
                  <TableHeadCellStyled key={index} style={{ 
                    width: columnWidths[index],
                    padding: '12px 8px'
                  }}>
                    {header}
                  </TableHeadCellStyled>
                ))}
              </tr>
            </thead>
            <tbody>
              {isSearchLoading ? (
                <TableRow>
                  <TableCell colSpan={headers.length}>
                    <Loading>Chargement des données...</Loading>
                  </TableCell>
                </TableRow>
              ) : sortedMissions.length > 0 ? (
                sortedMissions.map((mission: Mission) => {
                  const normalizedStatus = normalizeMissionStatus(mission.status);
                  const isValidated = validatedMissions[mission.missionId] || false;
                  const employeeName = `${mission.employee.firstName} ${mission.employee.lastName}`;
                  
                  const actions = getAvailableActions(mission.status, isValidated, mission.missionId);
                  const shouldShow = shouldShowActions(mission.status, isValidated, mission.missionId);
                  const isCompleted = isCompletedStatus(mission.status);
                  const isClosed = isClosedStatus(mission.status);
                  const hasReport = reportsByMissionId.has(mission.missionId);
                  
                  return (
                    <ClickableTableRow
                      key={mission.missionId}
                      $clickable={canViewDetails}
                      onClick={() => handleRowClick(mission.missionId)}
                      title={canViewDetails ? "Clic pour voir les détails" : ""}
                    >
                      <TableCell style={{ padding: '12px 8px' }}>
                        {renderCellContent(employeeName, false)}
                      </TableCell>
                      <TableCell style={{ padding: '12px 8px' }}>
                        {renderCellContent(mission.name, true)}
                      </TableCell>
                      <TableCell style={{ padding: '12px 8px' }}>
                        {renderCellContent(String(mission.missionType), false)}
                      </TableCell>
                      <TableCell style={{ padding: '12px 8px' }}>
                        {renderCellContent(mission.lieu.nom, false)}
                      </TableCell>
                      <TableCell style={{ 
                        padding: '4px 2px',
                        overflow: 'hidden',
                        maxWidth: '100%',
                        textAlign: 'center',
                      }}>
                        {renderStatus(getStatus(normalizedStatus))}
                      </TableCell>
                      <TableCell style={{ 
                        padding: '12px 8px',
                        overflow: 'hidden'
                      }}>
                        <DateCell style={{ fontSize: '14px' }}>
                          {formatDate(new Date(mission.startDate))}
                        </DateCell>
                      </TableCell>
                      <TableCell style={{ 
                        padding: '12px 8px',
                        overflow: 'hidden'
                      }}>
                        <DateCell style={{ fontSize: '14px' }}>
                          {formatDate(new Date(mission.endDate))}
                        </DateCell>
                      </TableCell>
                      {hasActions && shouldShow && (
                        <ActionsTableCell style={{ padding: '12px 8px' }}>
                          <ActionsContainer 
                            data-actions="true"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {/* Supprimer (uniquement pour annulé/rejeté) */}
                            {actions.showDelete && (
                              <ActionButton
                                variant="delete"
                                onClick={(e) => handleActionClick(e, onDeleteClick, mission)}
                                title="Supprimer"
                                disabled={isDeleting}
                              >
                                <Trash size={16} />
                              </ActionButton>
                            )}
                            
                            {/* Modifier (uniquement pour missions normales) */}
                            {actions.showEdit && (
                              <ActionButton
                                variant="edit"
                                onClick={(e) => handleActionClick(e, onEditClick, mission.missionId)}
                                title="Modifier"
                              >
                                <Edit size={16} />
                              </ActionButton>
                            )}
                            
                            {/* Annuler (uniquement pour missions normales) */}
                            {actions.showCancel && (
                              <ActionButton
                                variant="cancel"
                                onClick={(e) => handleActionClick(e, onCancelClick, mission)}
                                title="Annuler"
                              >
                                <X size={16} />
                              </ActionButton>
                            )}
                            
                            {/* Clôturer (uniquement pour missions terminées avec rapport) */}
                            {actions.showClose && isCompleted && canCloseMission && !isClosed && (
                              <ActionButton
                                variant="edit"
                                onClick={(e) => handleCloseClick(e, mission)}
                                title={hasReport ? "Clôturer la mission" : "Impossible de clôturer: aucun rapport"}
                                disabled={isClosing || !hasReport}
                                style={{ 
                                  backgroundColor: hasReport ? '#10b981' : '#9ca3af', 
                                  borderColor: hasReport ? '#10b981' : '#9ca3af', 
                                  color: 'white',
                                  cursor: hasReport ? 'pointer' : 'not-allowed'
                                }}
                              >
                                <CheckCircle size={16} />
                              </ActionButton>
                            )}
                          </ActionsContainer>
                        </ActionsTableCell>
                      )}
                      {hasActions && !shouldShow && (
                        <ActionsTableCell style={{ padding: '12px 8px' }}>
                          <ActionsContainer 
                            data-actions="true"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {/* Pas d'actions disponibles */}
                          </ActionsContainer>
                        </ActionsTableCell>
                      )}
                    </ClickableTableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={headers.length}>
                    <NoDataMessage>
                      {hasAppliedFilters ? "Aucune mission ne correspond aux critères." : "Aucune mission trouvée."}
                    </NoDataMessage>
                  </TableCell>
                </TableRow>
              )}
            </tbody>
          </DataTable>
          
          {hoveredContent && (
            <Tooltip
              style={{
                left: `${hoveredContent.x}px`,
                top: `${hoveredContent.y}px`,
                transform: 'translateX(-50%)',
                maxWidth: '400px',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
                zIndex: 1000,
              }}
            >
              {hoveredContent.text}
            </Tooltip>
          )}
        </div>
      ) : (
        <MissionCalendar 
          missions={sortedMissions}
        />
      )}
      
      {viewMode === 'table' && (
        <Pagination
          currentPage={page}
          pageSize={pageSize}
          totalEntries={totalCount}
          onPageChange={onPageChange}
          onPageSizeChange={onPageSizeChange}
        />
      )}
    </TableContainer>
  );
};

export default MissionTable;