<?php

namespace Drupal\fkr_booking\Form;

use Drupal\Core\Form\ConfirmFormBase;
use Drupal\Core\Form\FormStateInterface;
use Drupal\Core\Url;

class DeleteGjafabrefForm extends ConfirmFormBase {

  protected int $id;

  public function getFormId(): string {
    return 'fkr_booking_delete_gjafabref';
  }

  public function getQuestion() {
    return $this->t('Ertu viss um að þú viljir eyða gjafabréfspöntun #@id?', ['@id' => $this->id]);
  }

  public function getCancelUrl(): Url {
    return Url::fromRoute('fkr_booking.gjafabref_admin');
  }

  public function getConfirmText() {
    return $this->t('Eyða');
  }

  public function buildForm(array $form, FormStateInterface $form_state, ?int $id = NULL): array {
    $this->id = $id;
    return parent::buildForm($form, $form_state);
  }

  public function submitForm(array &$form, FormStateInterface $form_state): void {
    \Drupal::database()->delete('fkr_gjafabref')
      ->condition('id', $this->id)
      ->execute();

    $this->messenger()->addStatus($this->t('Gjafabréfspöntun #@id hefur verið eytt.', ['@id' => $this->id]));
    $form_state->setRedirectUrl($this->getCancelUrl());
  }

}
