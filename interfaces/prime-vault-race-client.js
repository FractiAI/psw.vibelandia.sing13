/** Prime-Vault Race · results-only client (no live play / no email gate). */
(function () {
  var TIERS = [
    {
      id: 'simple_ubiquitin',
      title: 'Tier 1 · Ubiquitin',
      blurb: 'Single-chain monomer · 76 residues. Vault phase-locks; ColabFold runs MSA-free neural fold.',
      vault: '0.051 ms',
      colabfold: '24.7 s',
      plddt: '48.4',
    },
    {
      id: 'complex_il2',
      title: 'Tier 2 · IL-2 complex',
      blurb: 'Heterodimer-class · 264 residues. Vaults as orthogonal prime containers; ColabFold multimer wall.',
      vault: '0.049 ms',
      colabfold: '154 s',
      plddt: '40.5',
    },
    {
      id: 'frontier_orphan',
      title: 'Tier 3 · Orphan synthetic',
      blurb: 'De novo lattice · 89 residues. No evolutionary MSA required for the vault lane.',
      vault: '0.014 ms',
      colabfold: '28.8 s',
      plddt: '31.2',
    },
    {
      id: 'unmodeled_nova',
      title: 'Tier 4 · Unmodeled Nova',
      blurb: 'Never-modeled Φ-cryptic · 112 residues. Decipher a protein with no prior AF/PDB model — vault live; ColabFold deferred.',
      vault: '0.029 ms',
      colabfold: 'deferred',
      plddt: '—',
    },
  ];

  function renderTiers() {
    var root = document.getElementById('pvr-tiers');
    if (!root) return;
    root.innerHTML = TIERS.map(function (t) {
      return (
        '<article class="pvr-card" role="listitem" data-tier="' +
        t.id +
        '">' +
        '<h3>' +
        t.title +
        '</h3>' +
        '<p>' +
        t.blurb +
        '</p>' +
        '<p class="pvr-card__result"><strong>Result:</strong> vault ' +
        t.vault +
        ' vs ColabFold ' +
        t.colabfold +
        (t.plddt !== '—' ? ' · pLDDT ~' + t.plddt : '') +
        '</p>' +
        '</article>'
      );
    }).join('');
  }

  renderTiers();
})();
