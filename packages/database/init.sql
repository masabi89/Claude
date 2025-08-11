-- Initialize control plane database
CREATE DATABASE promanage_control;

-- Create additional databases for development
CREATE DATABASE promanage_tenant_template;

-- Grant permissions
GRANT ALL PRIVILEGES ON DATABASE promanage_control TO promanage;
GRANT ALL PRIVILEGES ON DATABASE promanage_tenant_template TO promanage;

