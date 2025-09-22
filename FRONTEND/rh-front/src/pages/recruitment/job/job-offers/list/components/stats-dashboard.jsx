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
                        <StatLabel>Total des offres</StatLabel>
                    </StatContent>
                </StatCard>
                <StatCard className="stat-card-approved">
                    <StatIcon>
                        <CheckCircle size={24} />
                    </StatIcon>
                    <StatContent>
                        <StatNumber>{isLoading ? "..." : stats.publiee}</StatNumber>
                        <StatLabel>Publiées</StatLabel>
                    </StatContent>
                </StatCard>
                <StatCard className="stat-card-pending">
                    <StatIcon>
                        <Clock size={24} />
                    </StatIcon>
                    <StatContent>
                        <StatNumber>{isLoading ? "..." : stats.enCours}</StatNumber>
                        <StatLabel>En cours</StatLabel>
                    </StatContent>
                </StatCard>
                <StatCard className="stat-card-rejected">
                    <StatIcon>
                        <XCircle size={24} />
                    </StatIcon>
                    <StatContent>
                        <StatNumber>{isLoading ? "..." : stats.cloturee}</StatNumber>
                        <StatLabel>Clôturées</StatLabel>
                    </StatContent>
                </StatCard>
                <StatCard className="stat-card-cancelled">
                    <StatIcon>
                        <XCircle size={24} />
                    </StatIcon>
                    <StatContent>
                        <StatNumber>{isLoading ? "..." : stats.annulee}</StatNumber>
                        <StatLabel>Annulées</StatLabel>
                    </StatContent>
                </StatCard>
            </StatsGrid>
        </StatsContainer>
    );
};

export default StatsDashboard;