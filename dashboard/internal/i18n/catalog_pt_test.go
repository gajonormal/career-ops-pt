package i18n

import "testing"

func TestPortuguesePresentation(t *testing.T) {
	previous := Current
	defer func() { Current = previous }()
	for _, language := range []string{"pt", "pt-PT", "pt_PT"} {
		SetLang(language)
		if Current != &Pt || GetLang() != "pt" || Current.StatusLabel("applied") != "Candidatura enviada" {
			t.Fatalf("Portuguese display not selected for %q", language)
		}
	}
	SetLang("en")
	if Current.StatusLabel("applied") != "Applied" {
		t.Fatal("Portuguese display changed English/canonical status semantics")
	}
}
