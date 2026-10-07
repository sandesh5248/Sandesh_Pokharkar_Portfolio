// Cisco IOS & FortiGate Interactive CLI Simulator for Sandesh Pokharkar

document.addEventListener('DOMContentLoaded', () => {
    const cliModal = document.getElementById('cli-modal');
    const cliInput = document.getElementById('cli-input');
    const cliOutput = document.getElementById('cli-output');
    const openCliModalBtn = document.getElementById('open-cli-modal');
    const quickCliBtn = document.getElementById('quick-cli-btn');
    const closeCliModalBtn = document.getElementById('close-cli-modal-btn');
    const closeCliModalX = document.getElementById('close-cli-modal-x');
    const quickCmdBtns = document.querySelectorAll('.cli-quick-btn');

    function openModal() {
        if (cliModal) {
            cliModal.classList.remove('hidden');
            if (cliInput) cliInput.focus();
        }
    }

    function closeModal() {
        if (cliModal) cliModal.classList.add('hidden');
    }

    if (openCliModalBtn) openCliModalBtn.addEventListener('click', openModal);
    if (quickCliBtn) quickCliBtn.addEventListener('click', openModal);
    if (closeCliModalBtn) closeCliModalBtn.addEventListener('click', closeModal);
    if (closeCliModalX) closeCliModalX.addEventListener('click', closeModal);

    // Close on escape key
    window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && cliModal && !cliModal.classList.contains('hidden')) {
            closeModal();
        }
    });

    // Quick Command Pills Event Listener
    quickCmdBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const cmd = btn.textContent.trim();
            if (cliInput) {
                cliInput.value = cmd;
                processCommand(cmd);
            }
        });
    });

    if (cliInput) {
        cliInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                const cmd = cliInput.value.trim();
                processCommand(cmd);
                cliInput.value = '';
            }
        });
    }

    function appendOutput(htmlContent) {
        if (!cliOutput) return;
        const div = document.createElement('div');
        div.className = 'space-y-1';
        div.innerHTML = htmlContent;
        cliOutput.appendChild(div);
        cliOutput.scrollTop = cliOutput.scrollHeight;
    }

    function processCommand(rawCmd) {
        if (!rawCmd) return;

        // Print entered command prompt line
        appendOutput(`<p class="text-slate-400 font-bold"><span class="text-emerald-400">sandesh-router#</span> ${escapeHtml(rawCmd)}</p>`);

        const cmd = rawCmd.toLowerCase();

        if (cmd === 'clear' || cmd === 'cls') {
            cliOutput.innerHTML = `
                <p class="text-cyan-400">Console cleared. Type <span class="text-emerald-400 font-bold">help</span> for command list.</p>
            `;
            return;
        }

        if (cmd === 'help' || cmd === '?') {
            appendOutput(`
                <div class="text-cyan-300 font-bold">AVAILABLE CISCO & FORTIGATE CLI COMMANDS:</div>
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-1 text-slate-300">
                    <div><span class="text-emerald-400">show ip int brief</span> - View Cisco Interface IPs & Status</div>
                    <div><span class="text-emerald-400">show ospf neighbor</span> - Check OSPF Adjacency States</div>
                    <div><span class="text-emerald-400">show hsrp</span> - Display HSRP Redundancy State</div>
                    <div><span class="text-emerald-400">get system status</span> - FortiGate Firewall Summary</div>
                    <div><span class="text-emerald-400">show firewall policy</span> - List FortiGate Security Rules</div>
                    <div><span class="text-emerald-400">ping &lt;host&gt;</span> - Send ICMP Packet Echoes</div>
                    <div><span class="text-emerald-400">skills</span> - Display Sandesh's Technical Matrix</div>
                    <div><span class="text-emerald-400">experience</span> - Show NTT GDC / Kyndryl Role</div>
                    <div><span class="text-emerald-400">contact</span> - Show Phone, Email & LinkedIn</div>
                    <div><span class="text-emerald-400">clear</span> - Clear Terminal Screen</div>
                </div>
            `);
            return;
        }

        if (cmd.startsWith('show ip int') || cmd === 'sh ip int br' || cmd === 'sh ip int brief') {
            appendOutput(`
<pre class="text-slate-200">
Interface              IP-Address      OK? Method Status                Protocol
GigabitEthernet0/0/0   203.0.113.5     YES NVRAM  up                    up      
GigabitEthernet0/0/1   10.10.10.2      YES NVRAM  up                    up      
Vlan10 (Banking)       10.10.10.1      YES NVRAM  up                    up      
Vlan20 (Users)         10.10.20.1      YES NVRAM  up                    up      
Vlan30 (Guest WiFi)    10.10.30.1      YES NVRAM  up                    up      
Port-channel1 (LACP)   unassigned      YES unset  up                    up      
</pre>
            `);
            return;
        }

        if (cmd.startsWith('show ospf') || cmd === 'sh ospf nei') {
            appendOutput(`
<pre class="text-slate-200">
Neighbor ID     Pri   State           Dead Time   Address         Interface
10.10.10.3        1   FULL/DR         00:00:36    10.10.10.3      GigabitEthernet0/0/1
10.10.10.4        1   FULL/BDR        00:00:33    10.10.10.4      GigabitEthernet0/0/1
</pre>
            `);
            return;
        }

        if (cmd.startsWith('show hsrp') || cmd === 'sh hsrp') {
            appendOutput(`
<pre class="text-slate-200">
GigabitEthernet0/0/1 - Group 1
  State is Active
  Virtual IP address is 10.10.10.254
  Active router is local (10.10.10.3), priority 110 (conf 110)
  Standby router is 10.10.10.4, priority 90
  Group name is "HSRP_VLAN10" (cfgd)
</pre>
            `);
            return;
        }

        if (cmd === 'get system status' || cmd === 'get sys status') {
            appendOutput(`
<pre class="text-cyan-300">
Version: FortiGate-100F v7.2.4,build1396,230302 (GA.F)
Virus-DB: 89.00214 (2026-10-07 08:30)
Extended DB: 1.00000 (2026-10-07 08:30)
IPS-DB: 6.00741 (2026-10-07 04:12)
Serial-Number: FG100FTK21001234
Operation Mode: NAT
HA Mode: a-p, cluster index 0
Cluster Title: NTT-HDFC-FG-HA
System time: Wed Oct  7 20:24:17 2026
</pre>
            `);
            return;
        }

        if (cmd.includes('firewall policy') || cmd === 'sh fw pol') {
            appendOutput(`
<pre class="text-slate-200">
ID  srcintf  dstintf  srcaddr      dstaddr       action  service  status
1   VLAN10   port1    VLAN10_SUBNET  all           ACCEPT  HTTPS    ENABLE (AV, IPS)
2   VLAN20   port1    VLAN20_USERS   all           ACCEPT  HTTP/S   ENABLE (WebFilter)
3   port1    VLAN10   all          VIP_HDFC_APP  ACCEPT  HTTPS    ENABLE
</pre>
            `);
            return;
        }

        if (cmd.startsWith('ping')) {
            const host = rawCmd.split(' ')[1] || '8.8.8.8';
            appendOutput(`
                <p class="text-slate-300">Type escape sequence to abort.</p>
                <p class="text-slate-300">Sending 5, 100-byte ICMP Echos to ${escapeHtml(host)}, timeout is 2 seconds:</p>
                <p class="text-emerald-400 font-bold">!!!!!</p>
                <p class="text-slate-300">Success rate is 100 percent (5/5), round-trip min/avg/max = 1/1/2 ms</p>
            `);
            return;
        }

        if (cmd === 'skills') {
            appendOutput(`
                <div class="text-cyan-400 font-bold">SANDESH POKHARKAR TECHNICAL STACK:</div>
                <div class="text-slate-300">• Switching: VLANs, 802.1Q, STP/RSTP, EtherChannel (LACP), Inter-VLAN Routing</div>
                <div class="text-slate-300">• Routing: Static Routing, OSPF, HSRP First-Hop Redundancy</div>
                <div class="text-slate-300">• Security & NGFW: FortiGate Policies, NAT, IPsec & SSL VPN, ACLs, Port Security</div>
                <div class="text-slate-300">• Network Services: DHCP, DNS, NTP, Syslog, SNMP, IPv4/IPv6 Subnetting</div>
                <div class="text-slate-300">• Tools: Wireshark, Nmap, PuTTY/SSH, Cisco Packet Tracer, GNS3, EVE-NG</div>
            `);
            return;
        }

        if (cmd === 'experience') {
            appendOutput(`
                <div class="text-cyan-400 font-bold">WORK EXPERIENCE:</div>
                <div class="text-slate-100 font-bold">Network Support Engineer (L2) — Outworx (Payroll)</div>
                <div class="text-cyan-300 text-xs">Client: Kyndryl – HDFC | Workplace: NTT GDC, Ghatkopar, Mumbai (Sep 2025 – Present)</div>
                <div class="text-slate-300 text-xs border-l-2 border-cyan-500 pl-2 mt-1">
                    Provides 24x7 enterprise network monitoring & L2/L3 troubleshooting across Cisco routers, switches and FortiGate firewalls within strict SLAs.
                </div>
            `);
            return;
        }

        if (cmd === 'contact') {
            appendOutput(`
                <div class="text-cyan-400 font-bold">CONTACT NOC DETAILS:</div>
                <div class="text-slate-200">📱 Mobile: +91 9152600509</div>
                <div class="text-slate-200">✉️ Email: sandeshpokharkar5248@gmail.com</div>
                <div class="text-slate-200">🔗 LinkedIn: linkedin.com/in/sandeshpokharkar-942809418</div>
                <div class="text-slate-200">📍 Location: Dombivli, Maharashtra, India</div>
            `);
            return;
        }

        // Fallback for unknown command
        appendOutput(`
            <p class="text-red-400">% Invalid input detected at '^' marker.</p>
            <p class="text-slate-400">Type <span class="text-emerald-400 font-bold">help</span> for a list of valid commands.</p>
        `);
    }

    function escapeHtml(str) {
        return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    }
});
