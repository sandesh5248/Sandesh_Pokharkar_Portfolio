// Interactive Canvas Network Topology Simulator for Sandesh Pokharkar Portfolio

document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('topology-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    // Resize handling
    function resizeCanvas() {
        const rect = canvas.getBoundingClientRect();
        const dpr = window.devicePixelRatio || 1;
        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;
        ctx.scale(dpr, dpr);
    }
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Logical dimensions for drawing
    function getWidth() {
        return canvas.getBoundingClientRect().width;
    }
    function getHeight() {
        return canvas.getBoundingClientRect().height;
    }

    // Network Nodes Definition
    const nodes = [
        {
            id: 'cloud',
            name: 'ISP Gateway Cloud',
            ip: '203.0.113.1 /30',
            role: 'WAN Border / BGP Upstream',
            x: 0.15, y: 0.28,
            icon: '☁️',
            status: 'UP',
            details: [
                'Interface: WAN-port1 (203.0.113.1)',
                'Status: Link UP / 1Gbps Full Duplex',
                'Latency: 1.2ms average to NTT Edge'
            ]
        },
        {
            id: 'fortigate',
            name: 'FortiGate-100F NGFW',
            ip: '203.0.113.5 (WAN) | 10.10.10.1 (LAN)',
            role: 'Perimeter Security, NAT, IPsec & SSL VPN',
            x: 0.36, y: 0.28,
            icon: '🛡️',
            status: 'UP',
            details: [
                'Active Policies: FW-POL-01 (VLAN 10 -> Internet ALLOW)',
                'NAT: Source NAT (IP Pool) & VIP Port Forward (443)',
                'VPN: Site-to-Site IPsec Active (Tunnel UP)',
                'HA Cluster: Primary Mode (Active/Passive Sync OK)'
            ]
        },
        {
            id: 'core_router',
            name: 'Cisco 3945 Core Router',
            ip: '10.10.10.2 /24',
            role: 'Core Inter-VLAN Routing & OSPF Area 0',
            x: 0.58, y: 0.28,
            icon: '🔀',
            status: 'UP',
            details: [
                'OSPF Process 1: Area 0 (Router ID: 10.10.10.2)',
                'Inter-VLAN SVI: VLAN 10, 20, 30 Active',
                'ACL: EXT-ACL-101 (Banking Isolation Policy)'
            ]
        },
        {
            id: 'hsrp_active',
            name: 'Dist Switch A (HSRP Primary)',
            ip: '10.10.10.3 (VIP: 10.10.10.254)',
            role: 'L3 Distribution Switch (HSRP Priority 110)',
            x: 0.42, y: 0.68,
            icon: '⚡',
            status: 'UP',
            isHSRPPrimary: true,
            details: [
                'HSRP Group 1 State: ACTIVE',
                'EtherChannel: Po1 (2x 10G LACP Trunk to Core)',
                'Spanning Tree: PVST+ Root Bridge for VLAN 10/20'
            ]
        },
        {
            id: 'hsrp_standby',
            name: 'Dist Switch B (HSRP Backup)',
            ip: '10.10.10.4 (VIP: 10.10.10.254)',
            role: 'L3 Distribution Switch (HSRP Priority 90)',
            x: 0.72, y: 0.68,
            icon: '⚡',
            status: 'STANDBY',
            isHSRPPrimary: false,
            details: [
                'HSRP Group 1 State: STANDBY',
                'EtherChannel: Po2 (LACP Passive Trunk)',
                'Spanning Tree: Backup Root for VLAN 10/20'
            ]
        },
        {
            id: 'hdfc_core',
            name: 'HDFC Banking Data Center',
            ip: '10.10.10.50 /24 (VLAN 10)',
            role: 'Core Banking Application & DB Cluster',
            x: 0.85, y: 0.28,
            icon: '🏦',
            status: 'UP',
            details: [
                'Subnet: 10.10.10.0/24 (VLAN 10 Secure Tier)',
                'Access: Restricted by FortiGate IPS Profile',
                'Monitored by: Kyndryl NTT NOC Telemetry (24x7)'
            ]
        }
    ];

    // Connections between nodes
    const links = [
        { from: 'cloud', to: 'fortigate', label: '1G WAN Link' },
        { from: 'fortigate', to: 'core_router', label: '802.1Q Trunk' },
        { from: 'core_router', to: 'hsrp_active', label: 'Active Link (Po1)', active: true },
        { from: 'core_router', to: 'hsrp_standby', label: 'Standby Link (Po2)', active: false },
        { from: 'core_router', to: 'hdfc_core', label: 'VLAN 10 Core' },
        { from: 'hsrp_active', to: 'hsrp_standby', label: 'HSRP Heartbeat / L2 Trunk' }
    ];

    // Animated Packets
    let packets = [
        { linkIndex: 0, progress: 0, speed: 0.008, color: '#00f0ff' },
        { linkIndex: 1, progress: 0.3, speed: 0.007, color: '#00f0ff' },
        { linkIndex: 2, progress: 0.6, speed: 0.009, color: '#10b981' },
        { linkIndex: 4, progress: 0.1, speed: 0.006, color: '#3b82f6' }
    ];

    let selectedNode = nodes[1]; // Default selection FortiGate
    let isFailoverSimulated = false;

    // Update Node Inspector Sidebar DOM
    function updateInspector(node) {
        selectedNode = node;
        const nameEl = document.getElementById('node-name');
        const ipEl = document.getElementById('node-ip');
        const roleEl = document.getElementById('node-role');
        const detailsEl = document.getElementById('node-details');
        const badgeEl = document.getElementById('inspector-status-badge');

        if (nameEl) nameEl.textContent = node.name;
        if (ipEl) ipEl.textContent = node.ip;
        if (roleEl) roleEl.textContent = node.role;
        
        if (badgeEl) {
            badgeEl.textContent = node.status;
            badgeEl.className = `px-2.5 py-0.5 rounded-md text-[10px] font-bold border ${
                node.status === 'UP' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : 
                node.status === 'STANDBY' ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30' : 
                'bg-red-500/20 text-red-400 border-red-500/30'
            }`;
        }

        if (detailsEl && node.details) {
            detailsEl.innerHTML = node.details.map(d => `<div>• ${d}</div>`).join('');
        }
    }

    updateInspector(selectedNode);

    // Canvas Render Loop
    function draw() {
        const w = getWidth();
        const h = getHeight();

        ctx.clearRect(0, 0, w, h);

        // Draw Links
        links.forEach(link => {
            const nodeA = nodes.find(n => n.id === link.from);
            const nodeB = nodes.find(n => n.id === link.to);
            if (!nodeA || !nodeB) return;

            const x1 = nodeA.x * w;
            const y1 = nodeA.y * h;
            const x2 = nodeB.x * w;
            const y2 = nodeB.y * h;

            ctx.beginPath();
            ctx.moveTo(x1, y1);
            ctx.lineTo(x2, y2);

            if (link.active === false) {
                ctx.setLineDash([6, 6]);
                ctx.strokeStyle = '#475569';
                ctx.lineWidth = 1.5;
            } else {
                ctx.setLineDash([]);
                ctx.strokeStyle = '#0284c7';
                ctx.lineWidth = 2.5;
            }

            ctx.stroke();
            ctx.setLineDash([]);
        });

        // Update & Draw Packets
        packets.forEach(p => {
            const link = links[p.linkIndex];
            if (!link) return;

            const nodeA = nodes.find(n => n.id === link.from);
            const nodeB = nodes.find(n => n.id === link.to);
            if (!nodeA || !nodeB) return;

            p.progress += p.speed;
            if (p.progress >= 1) p.progress = 0;

            const px = (nodeA.x + (nodeB.x - nodeA.x) * p.progress) * w;
            const py = (nodeA.y + (nodeB.y - nodeA.y) * p.progress) * h;

            ctx.beginPath();
            ctx.arc(px, py, 4.5, 0, Math.PI * 2);
            ctx.fillStyle = p.color || '#00f0ff';
            ctx.shadowColor = p.color || '#00f0ff';
            ctx.shadowBlur = 12;
            ctx.fill();
            ctx.shadowBlur = 0;
        });

        // Draw Nodes
        nodes.forEach(node => {
            const nx = node.x * w;
            const ny = node.y * h;

            const isSelected = selectedNode && selectedNode.id === node.id;

            // Outer Selection Pulse Ring
            if (isSelected) {
                ctx.beginPath();
                ctx.arc(nx, ny, 28, 0, Math.PI * 2);
                ctx.strokeStyle = '#00f0ff';
                ctx.lineWidth = 2;
                ctx.shadowColor = '#00f0ff';
                ctx.shadowBlur = 10;
                ctx.stroke();
                ctx.shadowBlur = 0;
            }

            // Node Circle
            ctx.beginPath();
            ctx.arc(nx, ny, 22, 0, Math.PI * 2);
            ctx.fillStyle = node.status === 'DOWN' ? '#7f1d1d' : node.status === 'STANDBY' ? '#1e293b' : '#0c1222';
            ctx.strokeStyle = node.status === 'DOWN' ? '#ef4444' : node.status === 'STANDBY' ? '#64748b' : '#00f0ff';
            ctx.lineWidth = 2.5;
            ctx.fill();
            ctx.stroke();

            // Icon Symbol
            ctx.font = '16px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(node.icon, nx, ny);

            // Device Title Text Below
            ctx.font = '600 11px "Fira Code", monospace';
            ctx.fillStyle = isSelected ? '#00f0ff' : '#e2e8f0';
            ctx.fillText(node.name, nx, ny + 38);
        });

        requestAnimationFrame(draw);
    }

    draw();

    // Canvas Click Interaction to Select Node
    canvas.addEventListener('click', (e) => {
        const rect = canvas.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const clickY = e.clientY - rect.top;
        const w = getWidth();
        const h = getHeight();

        nodes.forEach(node => {
            const nx = node.x * w;
            const ny = node.y * h;
            const dist = Math.hypot(clickX - nx, clickY - ny);
            if (dist <= 35) {
                updateInspector(node);
                logTrace(`Selected node [${node.name}] - IP: ${node.ip}`);
            }
        });
    });

    // Helper log function
    function logTrace(msg, type = 'info') {
        const traceEl = document.getElementById('trace-log');
        if (!traceEl) return;
        const time = (performance.now() / 1000).toFixed(2);
        const p = document.createElement('p');
        p.className = type === 'success' ? 'text-emerald-400 font-bold' : type === 'warn' ? 'text-amber-400 font-bold' : 'text-cyan-400';
        p.textContent = `[${time}s] ${msg}`;
        traceEl.prepend(p);
    }

    // Button 1: Send ICMP Ping Echo
    const pingBtn = document.getElementById('sim-ping-btn');
    if (pingBtn) {
        pingBtn.addEventListener('click', () => {
            logTrace('PING 10.10.10.50 (HDFC Banking Core) with 32 bytes of data:', 'info');
            setTimeout(() => logTrace('Reply from 10.10.10.50: bytes=32 time=1.1ms TTL=64', 'success'), 300);
            setTimeout(() => logTrace('Reply from 10.10.10.50: bytes=32 time=1.2ms TTL=64', 'success'), 600);
            setTimeout(() => logTrace('Reply from 10.10.10.50: bytes=32 time=1.0ms TTL=64', 'success'), 900);
            setTimeout(() => logTrace('--- 10.10.10.50 ping statistics: 3 sent, 3 received, 0% packet loss ---', 'success'), 1200);
            
            // Spawn temporary ping packet animation
            packets.push({ linkIndex: 1, progress: 0, speed: 0.025, color: '#f59e0b' });
            packets.push({ linkIndex: 4, progress: 0, speed: 0.025, color: '#f59e0b' });
        });
    }

    // Button 2: Simulate Core Link Failover (HSRP Swap)
    const failoverBtn = document.getElementById('sim-failover-btn');
    if (failoverBtn) {
        failoverBtn.addEventListener('click', () => {
            isFailoverSimulated = !isFailoverSimulated;
            const activeNode = nodes.find(n => n.id === 'hsrp_active');
            const standbyNode = nodes.find(n => n.id === 'hsrp_standby');
            const statusText = document.getElementById('canvas-status-text');

            if (isFailoverSimulated) {
                links[2].active = false; // Po1 primary link fail
                links[3].active = true;  // Po2 backup link takeover
                activeNode.status = 'STANDBY';
                standbyNode.status = 'UP';
                logTrace('WARNING: Primary Link Po1 Down! HSRP Failover Triggered.', 'warn');
                logTrace('HSRP Group 1: Dist Switch B transitioned from Standby -> ACTIVE in 0.4s', 'success');
                if (statusText) statusText.textContent = 'HSRP Active Failover to Dist Switch B';
            } else {
                links[2].active = true;
                links[3].active = false;
                activeNode.status = 'UP';
                standbyNode.status = 'STANDBY';
                logTrace('PRIMARY LINK RESTORED: Dist Switch A resumed HSRP Active role (Preempt enabled).', 'success');
                if (statusText) statusText.textContent = 'System Nominal (All interfaces UP)';
            }
        });
    }

});
