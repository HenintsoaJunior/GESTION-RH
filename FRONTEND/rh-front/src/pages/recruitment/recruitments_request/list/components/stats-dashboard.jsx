import { Users, Clock, CheckCircle, XCircle } from "lucide-react";
import {
    StatsContainer,
    StatsGrid,
    StatCard,
    StatIcon,
    StatContent,
    StatNumber,
    StatLabel,
} from "styles/generaliser/table-container";

const StatsDashboard = ({ stats, isLoading = false }) => {
    return (
        <StatsContainer>
            <StatsGrid>
                <StatCard className="stat-card-total">
                    <StatIcon>
                        <Users size={24} />
                    </StatIcon>
                    <StatContent>
                        <StatNumber>{isLoading ? "..." : stats.total}</StatNumber>
                        <StatLabel>Total des demandes</StatLabel>
                    </StatContent>
                </StatCard>
                
                <StatCard className="stat-card-pending">
                    <StatIcon>
                        <Clock size={24} />
                    </StatIcon>
                    <StatContent>
                        <StatNumber>{isLoading ? "..." : stats.enAttente}</StatNumber>
                        <StatLabel>Brouillon</StatLabel>
                    </StatContent>
                </StatCard>
                
                <StatCard className="stat-card-progress">
                    <StatIcon>
                        <Clock size={24} />
                    </StatIcon>
                    <StatContent>
                        <StatNumber>{isLoading ? "..." : stats.enCours}</StatNumber>
                        <StatLabel>En Cours</StatLabel>
                    </StatContent>
                </StatCard>
                
                <StatCard className="stat-card-approved">
                    <StatIcon>
                        <CheckCircle size={24} />
                    </StatIcon>
                    <StatContent>
                        <StatNumber>{isLoading ? "..." : stats.approuvees}</StatNumber>
                        <StatLabel>Approuvées</StatLabel>
                    </StatContent>
                </StatCard>
                
                <StatCard className="stat-card-rejected">
                    <StatIcon>
                        <XCircle size={24} />
                    </StatIcon>
                    <StatContent>
                        <StatNumber>{isLoading ? "..." : stats.rejetees}</StatNumber>
                        <StatLabel>Rejetées</StatLabel>
                    </StatContent>
                </StatCard>
            </StatsGrid>
        </StatsContainer>
    );
};

export default StatsDashboard;